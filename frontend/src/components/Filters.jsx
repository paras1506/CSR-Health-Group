const Filters = ({ setTaluka, setDepartment }) => {
    return (
        <div className="flex gap-4">
            <select className="border p-2" onChange={(e) => setTaluka(e.target.value)}>
                <option value="">Select Taluka</option>
                <option value="Taluka 1">Taluka 1</option>
                <option value="Taluka 2">Taluka 2</option>
            </select>
            <select className="border p-2" onChange={(e) => setDepartment(e.target.value)}>
                <option value="">Select Department</option>
                <option value="Department 1">Department 1</option>
                <option value="Department 2">Department 2</option>
            </select>
        </div>
    );
};

export default Filters;
