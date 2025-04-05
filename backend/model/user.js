const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ["Appealer", "Verifier", "Admin", "Head of Department", "Donor"], required: true },
    panNumber: { type: String, required: true },
    GSTNumber: { type: String },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null }, // Only for department heads
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
