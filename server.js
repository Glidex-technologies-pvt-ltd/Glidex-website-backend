import express from 'express'
import nodemailer from 'nodemailer'
import cors from 'cors'
import dotenv from 'dotenv';
import passport from './config/passportConfig.js'; // Passport config file
import session from 'express-session'; // Session to manage user login state
import { userRoutes } from './Routes/user.routes.js';
import authRoutes from './Routes/auth.routes.js';
import mongoose from 'mongoose';

// Load environment variables from .env file
dotenv.config();

// Initialize app
const app = express();
app.use(express.json());
app.use(cors());

app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

// Initialize passport for handling authentication
app.use(passport.initialize());
app.use(passport.session());

// Use the routes
app.use(authRoutes);

// MongoDB connection
mongoose.connect("mongodb+srv://dev:Glidex%40123@cluster0.shf7f.mongodb.net/");
mongoose.set('debug', true);
const db = mongoose.connection;

db.on("open", () => {
    console.log("Connection Successful");
});

db.on("error", (error) => {
    console.log("Connection not Successful", error);
});

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
});


// POST Route for Form Submission
app.post("/submit-form", async (req, res) => {
  const { name, email, message, company, phoneno, contactmethod, occupation } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Fill required details" })
  }

  try {
    // Send Email to User
    const userMailOptions = {
      from: "dev.glidex@gmail.com",
      to: email,
      subject: "Form Submission Successful",
      text: `Dear ${name},\n\nThank you for filling out the form. We have received your message:\n"${message}".\n\nBest regards,\nGlideX Technologies`,
    };
    await transporter.sendMail(userMailOptions);

    // Send Email to Admin
    const adminMailOptions = {
      from: "dev.glidex@gmail.com",
      to: "dev.glidex@gmail.com",
      subject: "New Form Submission",
      text: `New form submission details:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}\nPhone no.: ${phoneno}\nCompany/Organization: ${company}\nPreferred Contact Method: ${contactmethod}\n Occupation: ${occupation}`,
    };
    await transporter.sendMail(adminMailOptions);

    res.status(200).json({ message: "Form submitted successfully." });
    console.log("Form submitted successfully.");

  } catch (error) {
    console.error("Error handling form submission:", error);
    res.status(500).json({ message: "Error submitting the form." });
  }
});

// POST Route for Subscriber
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please enter email" })
  }

  try {
    // Send Email to User
    const userMailOptions = {
      from: "dev.glidex@gmail.com",
      to: email,
      subject: "Thank You For Subscribing Us",
      text: `Thank you for subscribing.\nBest Regards,\nGlideX Technologies`,
    };
    await transporter.sendMail(userMailOptions);

    // Send Email to Admin
    const adminMailOptions = {
      from: "dev.glidex@gmail.com",
      to: "dev.glidex@gmail.com",
      subject: "New Subscriber",
      text: `Subscriber Email: ${email}`,
    };
    await transporter.sendMail(adminMailOptions);

    res.status(200).json({ message: "Thank you for subscribing" });
    console.log("Form submitted successfully.");

  } catch (error) {
    console.error("Error handling in subscribing:", error);
    res.status(500).json({ message: "Error in subscribing." });
  }
});

const PORT = process.env.PORT || 3000;
// Start the Server
app.listen(PORT, () => console.log("Server running on http://localhost:3000"));

userRoutes(app)