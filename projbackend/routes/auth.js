var express = require("express");
var router = express.Router();
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");
const { signout, signup, signin,isSignedIn } = require("../controllers/auth");
const OtpSender = require("../models/OtpSender");
const user = require("../models/user");

router.post(
  "/signup",
  [
    check("name", "name should be at least 3 char").isLength({ min: 3 }),
    check("email", "email is required").isEmail(),
    check("password", "password should be at least 3 char").isLength({ min: 3 })
  ],
  signup
);

router.post("/verifyOTP", async (req,res)=>{
  try{
    let {email,otp}=req.body;
    if(!email || !otp){
      throw Error("Empty otp details are not allowed");
    }else{
      const userOtpVerification= await OtpSender.findOne({
        email,
      })
      if(!userOtpVerification){
        throw new Error("Account already verified")
      }else{
        const {expiresAt}=userOtpVerification;
        const hashedOTP=userOtpVerification.otp;
        if(expiresAt<Date.now()){
          await OtpSender.deleteOne({email});
          throw new Error("Code has expired");
        }else{
          const validOtp= await bcrypt.compare(otp,hashedOTP);
          if(!validOtp){
            throw new Error ("Invalid code passed check your inbox");

          }else{
            //success
            await user.updateOne({email: email}, {verified:true});
            await OtpSender.deleteOne({email});
            res.json({
              status:"verified",
              message:`User email verified successfully`
            })
          }
        }
      }
    }
  } catch(error){
    res.json({
      status:"failed",
      message:error.message
    })
  }
})

//resend OTP verification

// router.post("/resendOTP",async (req,res)=>{
//   try {
//     let {userId,email}=req.body

//     if(!userId || !email){
//       throw Error("empty details are not allowed")
//     }else{
//       //delete existing records and resend
// const userOtpVerification= await OtpSender.findOne({
//         userId,
//       })
//       await userOtpVerification.deleteMany({userId});
//       sendOTPverificationEmail({_id:userId,email},res)
//     }
//   } catch (error) {
//     res.json({
//       status:"FAILED",
//       message:error.message
//     })
//   }
// })

router.post(
  "/signin",
  [
    check("email", "email is required").isEmail(),
    check("password", "password field is required").isLength({ min: 1 })
  ],
  signin
);


router.get("/signout", signout);

router.get("/testroute",isSignedIn,(req,res)=>{
    res.send("a protected route")
})

module.exports = router;
