import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

// Storage account details
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

// Authenticate using StorageSharedKeyCredential
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);

// Get container client
const containerClient = blobServiceClient.getContainerClient(containerName);

// Upload blob
export async function uploadToAzureBlob(blobContent, blobName) {
    try {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadResponse = await blockBlobClient.upload(blobContent, blobContent.length);
        console.log("Blob URL:", blockBlobClient.url)
        console.log("Blob uploaded successfully!", uploadResponse.requestId);
        return blockBlobClient.url
    } catch (error) {
        console.error("Error uploading blob:", error.message);
    }
}