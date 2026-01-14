const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Session = require("../models/Session");
const logger = require("./logger");


const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({ message: 'Email already in use' });
    }

    const existingName = await User.findOne({ name });
    if (existingName) {
      console.warn(`Registration attempt with existing name: ${name}`);
      return res.status(400).json({ message: 'Name already in use' });
    }

    // const hashedPassword = await bcrypt.hash(password, 10); // Removed: Model handles hashing

    const newUser = new User({
      name,
      email,
      password // Pass plain password, model middleware will hash it
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    console.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Registration Error: ' + err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Try finding user by email
    const user = await User.findOne({ email });

    if (!user) {
      logger.warning(`Login failed: No user found for ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user has passwordHash is not needed as we check isMatch below

    // Use model method to compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      logger.warning(`Login failed: Incorrect password for ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create or update session
    await Session.findOneAndUpdate(
      { userId: user._id },
      {
        refreshToken,
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );

    logger.info(`║ ✅ User ${user.email} logged in successfully`);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    logger.error("Login Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    await Session.findOneAndDelete({ userId: decoded.id });
    logger.info(`║ ✅ User ${decoded.name} logged out and session cleared`);

    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    logger.error("Logout Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt || user._id.getTimestamp()
    });
  } catch (err) {
    logger.error('Get Profile Error: ' + err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ id: user.id });
    res.json({ accessToken });
  });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });


    user.password = newPassword;
    await user.save();

    logger.info(`║ ✅ Password changed successfully for user ${user.email}`);
    res.status(200).json({ message: "Password changed successfully" });
  }
  catch (err) {
    logger.error("Change Password Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }

};



