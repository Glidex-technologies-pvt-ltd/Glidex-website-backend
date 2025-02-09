import { transporter } from '../config/nodemailerConfig.js';
import { downloadFromAzureBlob, uploadToAzureBlob } from "../config/excelStoreConfig.js";
import { saveToExcel, appendToExcel } from "../Model/excel.model.js";
import mailchimp from "../config/mailchimpConfig.js";

const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

export const handleSubscription = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please enter email' });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
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
      to: process.env.EMAIL_ADMIN,
      subject: 'New Subscriber',
      text: `New subscriber email: ${email}`,
    };
    await transporter.sendMail(adminMailOptions);

    await mailchimp.lists.addListMember(AUDIENCE_ID, {
      email_address: email,
      status: "subscribed"
    });

    const fileName = "subscribers.xlsx"; 
    const newEntry = { email };

    // Check if the file exists in Azure Blob Storage
    let fileBuffer = await downloadFromAzureBlob(fileName);

    if (fileBuffer) {
      console.log("Existing file found, appending data...");
      fileBuffer = appendToExcel(fileBuffer, newEntry);
    } else {
      console.log("No existing file, creating a new one...");
      fileBuffer = saveToExcel([newEntry]); // Create new file if none exists
    }

    // Upload updated file back to Azure Blob Storage
    const fileUrl = await uploadToAzureBlob(fileBuffer, fileName);

    res.status(200).json({ message: 'Thank you for subscribing' });
  } catch (error) {
    console.error('Error handling subscription:', error);
    res.status(500).json({ message: 'Error in subscribing' });
  }
};