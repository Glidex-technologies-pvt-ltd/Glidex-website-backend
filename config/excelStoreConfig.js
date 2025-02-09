import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_EXCEL_CONTAINER_NAME;

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Upload Excel file
export async function uploadToAzureBlob(buffer, fileName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    });

    console.log("Updated file uploaded successfully!", blockBlobClient.url);
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading blob:", error.message);
  }
}

// Download existing Excel file
export async function downloadFromAzureBlob(fileName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Check if the file exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      console.log("File does not exist, creating a new one.");
      return null;
    }

    const downloadResponse = await blockBlobClient.downloadToBuffer();
    console.log("Existing file downloaded.");
    return downloadResponse;
  } catch (error) {
    console.error("Error downloading blob:", error.message);
    return null;
  }
}
