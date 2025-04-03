const PublicContactSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "SolarRequest", required: true },
    contactPerson: { type: String, required: true },
    contactPhone: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PublicContact", PublicContactSchema);
