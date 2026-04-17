import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import AdminUser from "../models/AdminUser.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const username = "admin";
        const plainPassword = "000000";

        const existingAdmin = await AdminUser.findOne({ username });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(plainPassword, 12);

        await AdminUser.create({
            username,
            passwordHash,
        });

        console.log("Admin user created successfully.");
        console.log("username:", username);
        console.log("password:", plainPassword);

        process.exit(0);
    } catch (error) {
        console.error("Create admin error:", error);
        process.exit(1);
    }
};

createAdmin();