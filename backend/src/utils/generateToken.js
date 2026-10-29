
import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "60m" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      tokenType: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};
