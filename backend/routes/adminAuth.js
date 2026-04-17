import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import AdminUser from "../models/AdminUser.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import { adminIpAccessMiddleware, getClientIp } from "../middleware/adminIpMiddleware.js";

const router = express.Router();

/*
  GET /api/admin-auth/login-access
  Login sayfası gösterilsin mi?
*/
router.get("/login-access", adminIpAccessMiddleware, async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Access granted for login page.",
    });
});

/*
  POST /api/admin-auth/login
*/
router.post("/login", adminIpAccessMiddleware, async (req, res) => {
    try {
        const { username, password, deviceId } = req.body;

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

        const clientIp = getClientIp(req);

        if (adminUser.allowedIp && adminUser.allowedIp !== clientIp) {
            return res.status(403).json({
                success: false,
                message: "This IP is not allowed for admin access.",
            });
        }

        let finalDeviceId = deviceId;

        if (!finalDeviceId) {
            finalDeviceId = uuidv4();
        }

        if (!adminUser.allowedDeviceId) {
            adminUser.allowedDeviceId = finalDeviceId;
            adminUser.deviceBoundAt = new Date();
        } else if (adminUser.allowedDeviceId !== finalDeviceId) {
            return res.status(403).json({
                success: false,
                message: "This device is not authorized for admin access.",
            });
        }

        adminUser.lastLoginAt = new Date();
        await adminUser.save();

        req.session.admin = {
            userId: adminUser._id.toString(),
            username: adminUser.username,
            deviceId: finalDeviceId,
            ip: clientIp,
        };

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            deviceId: finalDeviceId,
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during login.",
        });
    }
});

/*
  GET /api/admin-auth/me
*/
router.get("/me", adminIpAccessMiddleware, adminAuthMiddleware, async (req, res) => {
    return res.status(200).json({
        success: true,
        admin: req.session.admin,
    });
});

/*
  POST /api/admin-auth/logout
*/
router.post("/logout", adminIpAccessMiddleware, adminAuthMiddleware, (req, res) => {
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