import dotenv from "dotenv";
dotenv.config();

import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import config from "./config.json" assert { type: "json" };
import { authenticateToken } from "./utils.js";
import User from './models/user.model.js';
import Note from './models/note.model.js';

mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000 // Increase timeout to 15 seconds
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process if connection fails
    });


const app = express();
app.use(express.json());


app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

// Create an account
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName) {
        return res.status(400).json({ error: true, message: "FullName is required" });
    }
    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ error: true, message: "Password is required" });
    }
    const isUser = await User.findOne({ email: email });
    if (isUser) {
        return res.json({
            error: true,
            message: "User already exist",
        });
    }

    const user = new User({
        fullName,
        email,
        password, // Fixed typo
    });

    await user.save();
    const accessToken = jwt.sign(
        { _id: user._id, email: user.email, fullName: user.fullName }, // Directly assign user details
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '36000m' }
    );


    console.log("Generated Token:", accessToken);


    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Successful",
    });
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const UserInfo = await User.findOne({ email: email });

    if (!UserInfo) {
        return res.status(400).json({ message: "User not found" });
    }
    if (UserInfo.email == email && UserInfo.password == password) { 
        const user = { user: UserInfo };
        const accessToken = jwt.sign(
            { _id: UserInfo._id, email: UserInfo.email, fullName: UserInfo.fullName }, 
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1000000' }
        );


        console.log("Generated Token:", accessToken);
        return res.json({
            error: false,
            message: "Login Successful",
            email,
            accessToken,
        });
    } else {
        return res.status(400).json({
            error: true,
            message: "Invalid Credentials",
        });
    }
});

// Add notes
app.post("/add-note", authenticateToken, async (req, res) => { 
    const { title, content, tags } = req.body;
    const user = req.user; 

    // Ensure userId is populated
    if (!req.user || !req.user._id) {
        return res.status(400).json({ error: true, message: "User ID is missing." });
    }

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    if (!content) {
        return res.status(400).json({ message: "Content is required" });
    }
    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id,
        });

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });
    } catch (error) {
        console.error("Error adding note:", error); // Log the error

        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});


//edit-notes
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const user = req.user;

    if (!title && !content && !tags) {
        return res
            .status(400)
            .json({ error: true, message: "No changes provided" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res
                .status(404)
                .json({ error: true, message: "Note not found" });
        }

        if (!title) note.title = title;
        if (!content) note.content = content;
        if (!tags) note.tags = tags;
        if (!isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

//get all notes
app.get("/get-all-notes/", authenticateToken, async (req, res) => {
    const user = req.user;

    try {
        const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
        return res.json({
            eroor: false,
            notes,
            message: "All notes retrieved successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }

});

//Get User
app.get("/get-user", authenticateToken, async (req, res) => {
    const user = req.user;

    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) return res.sendStatus(401);

    return res.json({
        user: {
            fullName: isUser.fullName,
            email: isUser.email,
            "_id": isUser._id,
            createdOn: isUser.createdOn
        },
        message: "",
    });
});


//delete note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const user = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({
                error: true,
                message: "Note not found"
            });
        }
        await Note.deleteOne({ _id: noteId, userId: user._id });

        return res.json({
            error: false,
            message: "Note deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error"
        });
    }
});


// update is Pinned
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const user = req.user;

    if (!isPinned) {
        return res
            .status(400)
            .json({ error: true, message: "No changes provided" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res
                .status(404)
                .json({ error: true, message: "Note not found" });
        }
        if (!isPinned) note.isPinned = isPinned || false;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "isPinned updated successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export app if needed (for testing, etc.)
export default app;
