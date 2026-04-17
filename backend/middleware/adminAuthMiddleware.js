const adminAuthMiddleware = (req, res, next) => {
    if (!req.session || !req.session.admin) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    next();
};

export default adminAuthMiddleware;