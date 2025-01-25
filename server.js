import express from 'express'
import nodemailer from 'nodemailer'
import cors from 'cors'
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize app
const app = express();
app.use(express.json());
app.use(cors());

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
      to: "Dev@glidex.tech",
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
      to: "Dev@glidex.tech",
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
