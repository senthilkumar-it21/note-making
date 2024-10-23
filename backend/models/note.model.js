import mongoose from "mongoose";

const { Schema } = mongoose;

const noteSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Required field
}, { timestamps: true });


export default mongoose.model("Note", noteSchema); // Use export default for ES modules
