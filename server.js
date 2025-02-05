import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passportConfig.js'; // Passport config
import { connectMongoDB } from './config/mongoConfig.js';
import { authRoutes } from './Routes/auth.routes.js';
import { userRoutes } from './Routes/user.routes.js';
import formRoutes from './Routes/form.routes.js';
import subscribeRoutes from './Routes/subscribe.routes.js';
import setupSocket from './config/webSocketConfig.js'
import http from "http";

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
const server = http.createServer(app);
setupSocket(server)

app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
}));

// Session Configuration
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectMongoDB();

// Start the Server
const PORT = process.env.PORT || 6000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Routes
authRoutes(app)
userRoutes(app)
app.use('/form', formRoutes);
app.use('/subscribe', subscribeRoutes);