import { io } from "socket.io-client";

const socket = io("http://localhost:6000");
console.log("hi");


socket.on("connect", () => {
    console.log("Connected to WebSocket server:", socket.id);
    console.log("hi");

    // Send a test drag-drop event
    socket.emit("drag-drop", { userId: "67a0d8286d942d00c7603b46", functionalityType: "basic" });

    // Listen for credit updates
    socket.on("creditUpdate", (data) => {
        console.log("Updated credits:", data);
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
