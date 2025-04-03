const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Verification = require("../model/verification");

// User Signup
exports.signup = async (req, res) => {
    try {
        const { fname,lname, email, password, phone, governmentId, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists." });

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            fname,
            lname,
            email,
            passwordHash,
            phone,
            governmentId,
            role
        });

        await user.save();

        // If user is not a Donor, send for verification
        if (role !== "Donor") {
            await new Verification({ userId: user._id }).save();
        }
        if(role !== "Donor"){
            res.status(201).json({ message: "Signup successful. Awaiting verification" });
        }
        else{
            res.status(201).json({ message: "Signup successful." });            
        }
    } catch (error) {
        res.status(500).json({ error: "Signup failed", details: error.message });
    }
};

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        

        if (!user) return res.status(401).json({ error: "Invalid credentials." });
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "2d" }
        );

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ error: "Login failed", details: error.message });
    }
};

// Verifier approves a user
exports.verifyUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { isVerified: true },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: "User not found." });

        res.json({ message: "User verified successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Verification failed", details: error.message });
    }
};

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-passwordHash");
        if (!user) return res.status(404).json({ error: "User not found." });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile", details: error.message });
    }
};
