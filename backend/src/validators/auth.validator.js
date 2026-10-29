export const validateRegister = (req,res,next) => {
    const { email, fullName, password, role } = req.body;

    if (!email || !fullName || !password || !role) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    next();
};

export const validateLogin = (req,res,next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    next();
};
