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
        allowedDeviceId: {
            type: String,
            default: null,
        },
        allowedIp: {
            type: String,
            default: null,
        },
        deviceBoundAt: {
            type: Date,
            default: null,
        },
        ipBoundAt: {
            type: Date,
            default: null,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

export default AdminUser;