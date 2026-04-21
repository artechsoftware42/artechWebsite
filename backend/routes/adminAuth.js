import express from "express";
import bcrypt from "bcryptjs";
import AdminUser from "../models/AdminUser.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import { adminLoginLimiter } from "../middleware/adminRateLimit.js";

const router = express.Router();

router.post("/login", adminLoginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required.",
            });
        }

        const adminUser = await AdminUser.findOne({ username });

        if (!adminUser) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        adminUser.lastLoginAt = new Date();
        await adminUser.save();

        req.session.admin = {
            userId: adminUser._id.toString(),
            username: adminUser.username,
        };

        return res.status(200).json({
            success: true,
            message: "Login successful.",
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during login.",
        });
    }
});

router.get("/me", adminAuthMiddleware, async (req, res) => {
    return res.status(200).json({
        success: true,
        admin: req.session.admin,
    });
});

router.post("/logout", adminAuthMiddleware, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({
                success: false,
                message: "Logout failed.",
            });
        }

        res.clearCookie("admin_sid");

        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    });
});

export default router;
