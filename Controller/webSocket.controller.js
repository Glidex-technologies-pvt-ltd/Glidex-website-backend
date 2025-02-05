import userModel from "../Model/user.model.js";
import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

// Initialize BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

/**
 * Handles credit deduction when a user performs drag-and-drop.
 */
export const handleDragDrop = async (socket, data) => {
    try {
        const { userId, functionalityType } = data;

        const user = await userModel.findById(userId);
        if (!user) return socket.emit("error", { message: "User not found" });

        const creditCost = getCreditCost(functionalityType);
        if (user.credits < creditCost) {
            return socket.emit("error", { message: "Insufficient credits" });
        }

        user.credits -= creditCost;
        await user.save();

        socket.emit("creditUpdate", { credits: user.credits });
    } catch (error) {
        console.error("Error handling drag-drop:", error);
        socket.emit("error", { message: "Error processing drag-drop" });
    }
};

/**
 * Handles refunding credits when a user deletes functionality before saving.
 */
export const handleDelete = async (socket, data) => {
    try {
        const { userId, functionalityType } = data;

        const user = await userModel.findById(userId);
        if (!user) return socket.emit("error", { message: "User not found" });

        const creditCost = getCreditCost(functionalityType);
        user.credits += creditCost;
        await user.save();

        socket.emit("creditUpdate", { credits: user.credits });
    } catch (error) {
        console.error("Error handling delete:", error);
        socket.emit("error", { message: "Error processing delete" });
    }
};

/**
 * Helper function to get credit cost for a specific functionality.
 */
const getCreditCost = (functionalityType) => {
    const creditCosts = {
        "basic": 5,
        "advanced": 10,
        "premium": 20,
    };
    return creditCosts[functionalityType] || 1;
};


//Socket for blob update
export const updateOnAzure = async (socket, data) => {
    try {
        const { blobName, updatedContent } = data;
        if (!blobName || !updatedContent) {
            return socket.emit("error", { message: "Blob name and updated content are required" });
        }

        // Get BlockBlobClient for the existing blob
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Check if the blob exists
        const exists = await blockBlobClient.exists();
        if (!exists) {
            return socket.emit("error", { message: "User not found" });
        }

        // Upload updated content (overwrite existing content)
        await blockBlobClient.upload(Buffer.from(updatedContent, "utf-8"), Buffer.byteLength(updatedContent), { overwrite: true });

        socket.emit("blobUpdated", { blobUrl: blockBlobClient.url })
    } catch (error) {
        console.error("Error updating blob:", error);
        socket.emit("error", { message: "Error updating blob:" });
    }
};