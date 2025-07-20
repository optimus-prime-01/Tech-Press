import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";

// Register user
export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409).json({ message: "User already exists" });
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, image: "" });
  const token = jwt.sign({ user }, process.env.JWT_SEC as string, { expiresIn: "5d" });
  res.status(201).json({ message: "User registered", token, user });
});

// Login user
export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ user }, process.env.JWT_SEC as string, { expiresIn: "5d" });
  res.status(200).json({ message: "Login success", token, user });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  res.json(user);
});

export const getUserProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({
      message: "No user with this id",
    });
    return;
  }

  res.json(user);
});

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { name, instagram, facebook, linkedin, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      name,
      instagram,
      facebook,
      linkedin,
      bio,
    },
    { new: true }
  );

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });

  res.json({
    message: "User Updated",
    token,
    user,
  });
});

export const updateProfilePic = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        message: "No file to upload",
      });
      return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to generate buffer",
      });
      return;
    }
    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        image: cloud.secure_url,
      },
      { new: true }
    );

    const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
      expiresIn: "5d",
    });

    res.json({
      message: "User Profile pic updated",
      token,
      user,
    });
  }
);