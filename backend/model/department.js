const DepartmentSchema = new mongoose.Schema({
    departmentName: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Department", DepartmentSchema);
