import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: "adminusers",
    }
);

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

export default AdminUser;