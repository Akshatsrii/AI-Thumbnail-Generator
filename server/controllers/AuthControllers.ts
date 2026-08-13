import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// ============================
// 📝 REGISTER USER
// ============================
export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Set session
    // @ts-ignore - Ignoring TS error for session extension for now
    req.session.isLoggedIn = true;
    req.session.userId = newUser._id.toString();

    return res.json({
      message: "Account created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// ============================
// 🔑 LOGIN USER
// ============================
export const LoginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Set session
    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();

    return res.json({
      message: "Login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// ============================
// 🚪 LOGOUT USER
// ============================
export const LogoutUser = async (req: Request, res: Response): Promise<any> => {
  req.session.destroy((error: any) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Logout failed" });
    }
    return res.json({ message: "Logout successful" });
  });
};

// ============================
// ✅ VERIFY USER (Fixes 401 Console Error)
// ============================
export const VerifyUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const session = req.session as any;

    if (!session || !session.userId) {
      return res.status(200).json({ isLoggedIn: false, user: null });
    }

    const user = await User.findById(session.userId);
    
    if (!user) {
      return res.status(200).json({ isLoggedIn: false, user: null });
    }

    return res.status(200).json({
      isLoggedIn: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error(error);
    // Only return 500 for actual server crashes
    return res.status(500).json({ isLoggedIn: false, message: "Server Error" });
  }
};