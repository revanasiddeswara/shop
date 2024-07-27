const OtpVerification = require('../models/OtpSender');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD
  }
});

const sendOTPverificationEmail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOption = {
      from: 'siddu10.klm@gmail.com',
      to: email,
      subject: 'verify your mail',
      html: `
      <div>
      <h2 className="widget-title">ಸರ್ವಮಂಗಳಾ ಎಂಟರ್ಪ್ರೈಸಸ್<span></span></h2>
      <p>Enter <b>${otp}</b> verify your account by entering this otp this code Expires in 1 Hour</p>
      </div>`
    }
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const newOtpVerification = await new OtpVerification({
      email: email,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 360000
    })

    await newOtpVerification.save();
    await transporter.sendMail(mailOption);

    // return OTP details
    return {
      status: 'pending',
      message: 'Verification OTP as send to Mail',
      data: {
        // userId: _id,
        email,
      }
    };
  } catch (error) {
    res.json({
      status: 'failed',
      message: error.message
    })
  }
};

module.exports = sendOTPverificationEmail;
