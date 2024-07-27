const mongoose=require("mongoose");
const {ObjectId}=mongoose.Schema;

const OtpsenderSchema=new mongoose.Schema({
    email:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date
})

module.exports=mongoose.model("OtpSender",OtpsenderSchema)