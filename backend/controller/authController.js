const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Verification = require("../model/verification");
const { verifyEmail, sendEmail } = require("../utils/verifyAndSendMail");

// User Signup
exports.signup = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const {
      fname,
      lname,
      email,
      password,
      phone,
      panNumber,
      GSTNumber,
      role,
      donorType,
    } = req.body;

    if (!["Donor", "Appealer"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Only Donor or Appealer can sign up." });
    }

    if (role === "Donor") {
      if (!donorType || !["Person", "Organization"].includes(donorType)) {
        return res
          .status(400)
          .json({ error: "Invalid or missing donor type." });
      }

      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z1-9]{1}[Z]{1}[A-Z0-9]{1}$/;

      if (!panNumber || !panRegex.test(panNumber)) {
        return res
          .status(400)
          .json({ error: "Invalid or missing PAN number." });
      }

      if (donorType === "Organization") {
        if (!GSTNumber || !gstRegex.test(GSTNumber)) {
          return res
            .status(400)
            .json({ error: "Invalid or missing GST number for organization." });
        }
      }
    }

    const { success, message } = await verifyEmail(email);
    if (!success) {
      return res.status(400).json({ error: message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      fname,
      lname,
      email,
      passwordHash,
      phone,
      panNumber,
      GSTNumber,
      role,
    });

    console.log("User before save:", user);
    // await user.save();

    await sendEmail(
      email,
      `
        <div style="text-align:center;">
          <img src="https://zpsangli.com/mr/img/Sangli_ZP.jpg" alt="Zilha Parishad Sangli" style="max-width:200px; margin-bottom: 20px;" />
        </div>
    
        <h2 style="text-align:center;">Welcome to <span style="color:#27ae60;">Vardaan</span>, ${fname}!</h2>
        <p style="text-align:center; color:#888; font-style:italic; margin-top:-10px;">Rural Development through Aid and Assistance Network</p>
    
        <p>Thank you for joining <strong>Vardaan</strong>, the official Corporate Social Responsibility (CSR) initiative by <strong>Zilha Parishad Sangli</strong>.</p>
    
        <p>This platform bridges the gap between the needs of educational and welfare institutions across Sangli District and individuals or organizations willing to contribute towards their growth.</p>
    
        <p>Your account has been created successfully, and you can now explore opportunities to <strong>donate items</strong> based on specific requirements listed by verified institutions.</p>
    
        ${
          role !== "Donor"
            ? `<p>As a <strong>${role}</strong>, your account is currently under review. Our team will verify your information shortly, and you will be notified once the process is complete.</p>`
            : `<p>You can now browse listed needs from schools, hostels, and other institutes, and make meaningful contributions with ease.</p>`
        }
    
        <hr/>
    
        <p style="color:#555;">If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@zpsngvardaan.in">support@zpsngvardaan.in</a>.</p>
    
        <p style="margin-top:30px;">Warm regards,<br/>
        <strong>Team Vardaan<br/>Zilha Parishad Sangli</strong></p>
      `,
      "Welcome to Vardaan - A CSR Initiative by Zilha Parishad Sangli"
    );

    if (role !== "Donor") {
      await new Verification({ userId: user._id }).save();
      return res
        .status(201)
        .json({ message: "Signup successful. Awaiting verification." });
    } else {
      return res.status(201).json({ message: "Signup successful." });
    }
  } catch (error) {
    console.log("Error during signup:", error);
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
    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials." });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.json({ success: true, token, user });
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
    res
      .status(500)
      .json({ error: "Verification failed", details: error.message });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch user profile", details: error.message });
  }
};
