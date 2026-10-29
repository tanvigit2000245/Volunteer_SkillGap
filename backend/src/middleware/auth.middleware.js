import jwt from "jsonwebtoken";

// Protects routes — expects: Authorization: Bearer <accessToken>
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id, email, role, iat, exp }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Restricts a route to specific roles, e.g. restrictTo("admin", "coordinator")
export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: "Access denied. Insufficient role." });
  }
  next();
};

// Validate register body — fullName, email, password, role required
export const validateRegister = (req, res, next) => {
  const { fullName, email, password, role } = req.body;
  const validRoles = ["admin", "volunteer", "coordinator"];

  if (!fullName?.trim() || !email?.trim() || !password || !role) {
    return res.status(400).json({ success: false, message: "fullName, email, password and role are all required" });
  }
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: `role must be one of: ${validRoles.join(", ")}` });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  next();
};

// Validate login body — email and password required
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  next();
};
