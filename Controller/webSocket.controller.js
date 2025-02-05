import userModel from "../Model/user.model.js";

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
