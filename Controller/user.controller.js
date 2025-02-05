import userModel from "../Model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { uploadToAzureBlob } from '../config/azureBlobConfig.js';
import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import { sendOtpEmail } from "../config/nodemailerConfig.js";

dotenv.config();

// Initialize BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

//Api for user registration
export function userRegistration(req, res) {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validate Email Format
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (!fullName || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "Fill the required fields" });
    };

    if (password != confirmPassword) {
        return res.status(400).json({ message: "Password and Confirm Password should be same" });
    };

    userModel.findOne({ email }).then(data => {
        if (data) {
            return res.status(400).json({ message: "Email already registered" });
        }
        else {
            sendOtpEmail(email).then(otp => {
                if (!otp) {
                    return res.status(500).json({ message: "Failed to send OTP. Try again." });
                }
                const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
                const newUser = new userModel({
                    fullName: fullName,
                    otp,
                    otpExpiry,
                    email: email,
                    password: bcrypt.hashSync(password, 10)
                });

                newUser.save().then(data => {
                    if (!data) {
                        return res.status(400).json({ message: "User not register! Try again" });
                    }
                    res.status(200).send(data);
                }).catch(err => res.status(500).json({ message: err.message }));
            })

        }
    }).catch(err => res.status(500).json({ message: err.message }));
};

//Api for user login
export function userLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Fill the required fields" });
    }

    userModel.findOne({ email }).then(data => {
        if (!data) {
            return res.status(403).json({ message: "Invalid Email" });
        }

        //Compare a password
        let isValidPassword = bcrypt.compareSync(password, data.password);

        if (!isValidPassword) {
            return res.status(403).json({ message: "Invalid Password" });
        }

        //Generate a jwt token for authenticate
        let token = jwt.sign({ id: data._id }, "ProjectKey");

        res.status(200).send({
            user: {
                fullName: data.fullName
            },
            accessToken: token
        })

    }).catch(err => res.status(500).json({ message: err.message }));
};

// Fetch User Data including Code URL
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error fetching user data" });
    }
};

// Upload Code File to Azure and Save URL in DB
export const uploadUserCode = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fileContent } = req.body; // Assuming raw text is sent in request

        // Fetch user
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const fileName = `user-${userId}-${Date.now()}.txt`;
        const blobUrl = await uploadToAzureBlob(Buffer.from(fileContent, "utf-8"), fileName);

        // Update user model with Blob URL
        user.blobUrl.push(blobUrl);
        await user.save();

        res.status(200).json({ message: "Code uploaded successfully", blobUrl: blobUrl });
    } catch (error) {
        res.status(500).json({ error: "Error uploading code" });
    }
};

//Fetch code from azure blob and return as response
export const getBlobContent = async (req, res) => {
    try {
        const { blobName } = req.body; // Expecting { blobName: "user-12345.txt" }
        if (!blobName) return res.status(400).json({ error: "Blob name is required" });

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadResponse = await blockBlobClient.download();
        const downloadedContent = await streamToString(downloadResponse.readableStreamBody);

        res.status(200).json({ content: downloadedContent });
    } catch (error) {
        console.error("Error fetching blob content:", error.message);
        res.status(500).json({ error: "Error fetching blob content" });
    }
}

// Convert stream to string
const streamToString = async (readableStream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (chunk) => chunks.push(chunk.toString()));
        readableStream.on("end", () => resolve(chunks.join("")));
        readableStream.on("error", reject);
    });
}

//Update code on azure blob strage
export const updateOnAzure = async (req, res) => {
    try {
        const { blobName, updatedContent } = req.body;
        if (!blobName || !updatedContent) {
            return res.status(400).json({ error: "Blob name and updated content are required" });
        }

        // Get BlockBlobClient for the existing blob
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Check if the blob exists
        const exists = await blockBlobClient.exists();
        if (!exists) {
            return res.status(404).json({ error: "Blob not found" });
        }

        // Upload updated content (overwrite existing content)
        await blockBlobClient.upload(Buffer.from(updatedContent, "utf-8"), Buffer.byteLength(updatedContent), { overwrite: true });

        res.status(200).json({ message: "Code updated successfully", blobUrl: blockBlobClient.url });
    } catch (error) {
        console.error("Error updating blob:", error.message);
        res.status(500).json({ error: "Error updating blob" });
    }
};

// API Endpoint to Delete a Blob
export const deleteFromAzure = async (req, res) => {
    try {
        const { blobName } = req.body;
        if (!blobName) {
            return res.status(400).json({ error: "Blob name is required" });
        }

        // Get BlockBlobClient for the existing blob
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Check if the blob exists
        const exists = await blockBlobClient.exists();
        if (!exists) {
            return res.status(404).json({ error: "Blob not found" });
        }

        // Delete the blob
        await blockBlobClient.delete();

        res.status(200).json({ message: "Code deleted successfully" });
    } catch (error) {
        console.error("Error deleting blob:", error.message);
        res.status(500).json({ error: "Error deleting blob" });
    }
};