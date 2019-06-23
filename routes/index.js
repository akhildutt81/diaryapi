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
    ref.on('value',(snapshot)=>{
      snapshot.forEach((child)=>{
        let v=child.val()
        if(v.username===username && v.password===password){
          token=jwt.sign({id:v.key},secret,{expiresIn:25,algorithm:'HS256'});
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
    let token=jwt.sign({id},secret,{expiresIn:25,algorithm:'HS256'});
  	res.json({
      token
    }); 
  }
  catch(err){
    console.log(err);
  }
})
module.exports = router;

router.post('/isvalid',(req, res, next)=>{
  try{
    console.log(req.body.token)
    jwt.verify(
      req.body.token,
      secret,
      {algorithm:'HS256'}
    )
    return res.json({
      "status":"is valid"
    })
  }
  catch(err){
    console.log(err);
    return res.json({
      "status":"could not validate",
    })
  }
})
module.exports = router;
