const FulfillmentSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "SolarRequest", required: true },
    headId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fulfilledCapacity: { type: String, required: true },
    fulfillmentStatus: { type: String, enum: ["In Progress", "Completed"], default: "In Progress" },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Fulfillment", FulfillmentSchema);
