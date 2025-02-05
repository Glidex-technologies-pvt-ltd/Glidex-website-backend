import { Server } from "socket.io";
import { handleDragDrop, handleDelete } from "../Controller/webSocket.controller.js";

export default function setupSocket(server) {

    const io = new Server(server, {
        cors: {
            origin: "*",  // Update with your frontend URL
            methods: ["GET", "POST", "DELETE", "PATCH", "PUT"]
        }
    });
    
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
    
        // Listen for drag-drop events
        socket.on("drag-drop", (data) => handleDragDrop(socket, data));
    
        // Listen for delete events
        socket.on("delete", (data) => handleDelete(socket, data));
    
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

   return io;
}
