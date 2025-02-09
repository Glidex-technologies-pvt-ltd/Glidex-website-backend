import { transporter } from '../config/nodemailerConfig.js';
import { downloadFromAzureBlob, uploadToAzureBlob } from "../config/excelStoreConfig.js";
import { saveToExcel, appendToExcel } from "../Model/excel.model.js";

export const handleFormSubmission = async (req, res) => {
  const { name, email, message, company, phoneno, contactmethod, occupation } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Fill required details' });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
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
      to: process.env.EMAIL_ADMIN,
      subject: 'New Form Submission',
      text: `Details:\nName: ${name}\nEmail: ${email}\nMessage: ${message}\nPhone: ${phoneno}\nCompany: ${company}\nContact Method: ${contactmethod}\nOccupation: ${occupation}`,
    };
    await transporter.sendMail(adminMailOptions);

    // Save data locally in Excel
    const fileName = "user-data.xlsx"; 
    const newEntry = { name, email, message, company, phoneno, contactmethod, occupation };

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

    res.status(200).json({ message: "Form submitted successfully", fileUrl });

    // res.status(200).json({ message: 'Form submitted successfully', blobUrl });
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ message: 'Error submitting the form' });
  }
};