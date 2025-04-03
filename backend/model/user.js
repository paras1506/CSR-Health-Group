const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    governmentId: { type: String, unique: true, sparse: true }, // ✅ Not required for all, but must be unique if provided
    role: { type: String, enum: ["Appealer", "Verifier", "Admin", "Head of Department", "Donor"], required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null }, // Only for department heads
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
