import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendToken } from "../utils/generateToken.js";


//I am creating this so that I can give generic data as a response
const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("Email is already registered");
  }

  const user = await User.create({ name, email, password });
  sendToken(res, user._id);
  res.status(201).json(publicUser(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  sendToken(res, user._id);
  res.json(publicUser(user));
});

export const logout = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out" });
};

export const getMe = (req, res) => res.json(publicUser(req.user));
