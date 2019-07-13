let express = require('express');
let jwt=require('jsonwebtoken');
var router = express.Router();
let firebase=require('firebase');
let secret='1997';
const firebaseConfig = {
  apiKey: "AIzaSyDVYsbPAczVB-yNta4RpwI6lyeVskQrA20",
  authDomain: "mydiary-7f820.firebaseapp.com",
  databaseURL: "https://mydiary-7f820.firebaseio.com",
  projectId: "mydiary-7f820",
  storageBucket: "",
  messagingSenderId: "444202034332",
  appId: "1:444202034332:web:5b13eb9d3ded9bd8"
};
firebase.initializeApp(firebaseConfig);

router.get('/', (req, res, next) => {
  res.json({
    "AppName":"My Name",
    "cookies":req.cookies,
  })
});

router.post('/login',(req,res,next)=>{
  try{
    let username=req.body.username;
    let password=req.body.password;
    let id;
    let ref=firebase.database().ref('/signedupUsers');
    let token=null
    console.log("checking for "+username+password)
    ref.on('value',(snapshot)=>{
      snapshot.forEach((child)=>{
        let v=child.val()
        console.log(v.username+" "+v.password+" "+child.key)
        if(v.username===username && v.password===password){
          let pl={
            id:child.key
          }
          console.log('signed')
          console.log(pl)
          token=jwt.sign(pl,secret,{expiresIn:6000,algorithm:'HS256'});
        }
      })
    })
    return res.json({
      token
    })
  }
  catch(err){
    //console.log(err)
    return res.json({})
  }
  return res.json({})
})

router.post('/signup',(req, res, next)=>{
  try{
  	let ref=firebase.database().ref('/signedupUsers');
    let username=req.body.username
  	let obj={
  		"username":username,
  		"password":req.body.password,
  	}
  	let id=ref.push(obj).getKey();
    let token=jwt.sign({id},secret,{expiresIn:6000,algorithm:'HS256'});
  	return res.json({
      token
    }); 
  }
  catch(err){
    console.log(err);
  }
  return res.json({"hi":"hi"})
})

router.post('/isvalid',(req, res, next)=>{
  try{
    console.log(req.body.token)
    let tk=jwt.verify(
      req.body.token,
      secret,
      {algorithm:'HS256'},
    )
      return res.json({
        "status":true
      })
  }
  catch(err){
    console.log(err);
    return res.json({
      "status":false,
    })
  }
})


router.post('/insertinto/:date',(req,res,next)=>{
  //console.log("Posting into ")
  try{
    console.log("inside first try");
    let tk=jwt.verify(req.body.token,secret,{algorithm:'HS256'})
    let entry=req.body.entry;
    let date=req.params.date;
    let ref=firebase.database().ref('/signedupUsers/'+tk.id+'/entries');
    try{
      console.log("inside second try");
      ref.child(req.body.year).child(req.body.month).child(req.body.day).set(entry);
    }
    catch(error){
      console.log("no child entry")
    }
  }
  catch(error){
    console.log(error)
  }
  return res.json({
    "stat":"succ"
  })
})

router.post('/getentry/:year/:month/:date?',(req,res,next)=>{
  try{
    let tk=jwt.verify(req.body.token,secret,{algorithm:'HS256'})
    let ref=firebase.database().ref('/signedupUsers')
    ref=ref.child(tk.id)
    ref=ref.child('entries')
    ref=ref.child(req.params.year)
    ref=ref.child(req.params.month)
    console.log(req.params)
    let result=[]
    if(req.params.date!=null && req.params.date!=undefined){
      ref.on('value',(snapshot)=>{
        snapshot.forEach((child)=>{
          console.log(child.key+" "+req.params.date+" "+(child.key==req.params.date))
          if(child.key==req.params.date){
            result.push(child.val())
          }
        })
      })
      console.log("returning")
      console.log(result)
      return res.json(result)
    }
    ref.on('value',(snapshot)=>{
      console.log(snapshot)
      snapshot.forEach((child)=>{
        console.log(child.key+" "+child.val())
        result.push([child.key])
      })
      console.log("returning")
      console.log(result)
      return res.json(result)
    })
  }
  catch(err){
    console.log(err)
    return res.json(err)
  }
})

module.exports = router;

console.log(router)