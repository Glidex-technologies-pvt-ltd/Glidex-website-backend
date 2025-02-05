import { transporter } from '../config/nodemailerConfig.js';

export const handleSubscription = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please enter email' });
  }

  try {
    // Send email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank You For Subscribing',
      text: `Thank you for subscribing to our newsletter.\n\nBest regards,\nGlideX Technologies`,
    };
    await transporter.sendMail(userMailOptions);

    // Send email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Subscriber',
      text: `New subscriber email: ${email}`,
    };
    await transporter.sendMail(adminMailOptions);

    res.status(200).json({ message: 'Thank you for subscribing' });
  } catch (error) {
    console.error('Error handling subscription:', error);
    res.status(500).json({ message: 'Error in subscribing' });
  }
};