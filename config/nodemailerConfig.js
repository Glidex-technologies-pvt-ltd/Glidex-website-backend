import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import otpGenerator from 'otp-generator';

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // debug: true,
  // logger: true,
});

// Function to generate and send OTP
export const sendOtpEmail = async (email) => {
  // Generate a 6-digit numeric OTP
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

  // Email content
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return otp; // Return OTP to store in DB for verification
  } catch (error) {
    console.error("Error sending OTP:", error);
    return null;
  }
};