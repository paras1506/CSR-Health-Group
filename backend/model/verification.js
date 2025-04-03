const mongoose = require("mongoose");

const VerificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    verifierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    createdAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date }
});

module.exports = mongoose.model("Verification", VerificationSchema);
