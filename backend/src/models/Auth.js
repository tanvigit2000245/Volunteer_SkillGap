
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "volunteer", "coordinator"],
      required: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
authSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password during login
authSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Auth =
  mongoose.models.Auth || mongoose.model("Auth", authSchema);

export default Auth;
