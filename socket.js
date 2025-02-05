import { io } from "socket.io-client";

const socket = io("http://localhost:6000");
console.log("hi");


socket.on("connect", () => {
    console.log("Connected to WebSocket server:", socket.id);
    console.log("hi");

    // Send a test drag-drop event
    socket.emit("updateBlob", { blobName: "user-67a315956fa6e2bfaa21815f-1738743974061.txt", updatedContent: "Testing Socket" });

    // Listen for credit updates
    socket.on("blobUpdated", (data) => {
        console.log("Updated Blob:", data);
    });

    // Listen for errors
    socket.on("error", (err) => {
        console.error("Error:", err);
    });

    // Disconnect after testing
    setTimeout(() => {
        socket.disconnect();
    }, 5000);
});
