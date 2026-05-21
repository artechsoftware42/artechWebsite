import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
    {
        key: String,
        value: mongoose.Schema.Types.Mixed,
    },
    { _id: false }
);

const SectionSchema = new mongoose.Schema(
    {
        name: String,
        contents: [ContentSchema],
    },
    { _id: false }
);

const PageSchema = new mongoose.Schema(
    {
        pageKey: { type: String, required: true, unique: true },
        title: String,
        sections: [SectionSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Page", PageSchema, "Home");