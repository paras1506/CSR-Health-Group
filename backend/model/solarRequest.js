const mongoose = require("mongoose");

const SolarRequestSchema = new mongoose.Schema({
    organisationName: { type: String, required: true },
    institutionType: { type: String, required: true },
    villageName: { type: String, required: true },
    taluka: { type: String, required: true },
    solarDemand: { type: String, required: true },
    district: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fulfillmentPercentage: { type: Number, default: 0 },
    donors: [
        {
            donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            name: String,
            email: String,
            phone: String,
            donatedForOrganization: String,
            date: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("SolarRequest", SolarRequestSchema);
