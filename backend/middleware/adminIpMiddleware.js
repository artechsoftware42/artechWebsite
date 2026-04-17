import AdminUser from "../models/AdminUser.js";

const normalizeIp = (ip) => {
  if (!ip) return "";
  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  return ip;
};

export const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    return normalizeIp(firstIp);
  }

  return normalizeIp(req.ip);
};

export const adminIpAccessMiddleware = async (req, res, next) => {
  try {
    const adminUser = await AdminUser.findOne({ username: "admin" });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found.",
      });
    }

    const clientIp = getClientIp(req);

    if (!adminUser.allowedIp) {
      adminUser.allowedIp = clientIp;
      adminUser.ipBoundAt = new Date();
      await adminUser.save();
      return next();
    }

    if (adminUser.allowedIp !== clientIp) {
      return res.status(403).json({
        success: false,
        message: "This IP is not allowed.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin IP middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "IP validation failed.",
    });
  }
};