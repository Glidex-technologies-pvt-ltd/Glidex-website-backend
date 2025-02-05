import { transporter } from '../config/nodemailerConfig.js';

export const handleFormSubmission = async (req, res) => {
  const { name, email, message, company, phoneno, contactmethod, occupation } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Fill required details' });
  }

  try {
    // Send email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Form Submission Successful',
      text: `Dear ${name},\n\nThank you for your message: "${message}".\n\nBest regards,\nGlideX Technologies`,
    };
    await transporter.sendMail(userMailOptions);

    // Send email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Form Submission',
      text: `Details:\nName: ${name}\nEmail: ${email}\nMessage: ${message}\nPhone: ${phoneno}\nCompany: ${company}\nContact Method: ${contactmethod}\nOccupation: ${occupation}`,
    };
    await transporter.sendMail(adminMailOptions);

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ message: 'Error submitting the form' });
  }
};