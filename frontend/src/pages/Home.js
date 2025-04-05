import React, { useEffect, useState } from "react";
import axios from "axios";
import SolarCard from "../components/SolarCard";
import { useNavigate } from "react-router-dom";

const Demands = () => {
  const [solarRequests, setSolarRequests] = useState([]);
  const [searchVillage, setSearchVillage] = useState("");
  const [villageSuggestions, setVillageSuggestions] = useState([]);
  const [selectedTaluka, setSelectedTaluka] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const navigate = useNavigate();

  // Fetch all solar requests
  const fetchAllRequests = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/solar/all");
      setSolarRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch solar requests:", err);
    }
  };

  // Handle search input change
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchVillage(query);

    if (query.length >= 2) {
      try {
        const res = await axios.get(`http://localhost:4000/api/v1/solar/search?village=${query}`);
        setVillageSuggestions(res.data);
      } catch (err) {
        console.error("Search error:", err);
      }
    } else {
      setVillageSuggestions([]);
    }
  };

  // Apply filters based on selected taluka and department
  const applyFilters = async () => {
    let url = "http://localhost:4000/api/v1/solar/filter?";
    if (selectedTaluka) url += `taluka=${selectedTaluka}&`;
    if (selectedDept) url += `department=${selectedDept}&`;

    try {
      const res = await axios.get(url);
      setSolarRequests(res.data);
    } catch (err) {
      console.error("Filter error:", err);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // Effect to apply filters on selectedTaluka or selectedDept change
  useEffect(() => {
    applyFilters();
  }, [selectedTaluka, selectedDept]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Solar Requests</h1>

      {/* Search and Filter Section */}
      <div className="flex gap-4 mb-4">
        {/* Search by Village */}
        <div className="flex flex-col">
          <input
            type="text"
            value={searchVillage}
            onChange={handleSearchChange}
            placeholder="Search by village"
            className="p-2 border rounded"
          />
          {villageSuggestions.length > 0 && (
            <ul className="bg-white border mt-1 rounded shadow p-2">
              {villageSuggestions.map((village, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSearchVillage(village);
                    setVillageSuggestions([]);
                  }}
                  className="cursor-pointer hover:bg-gray-100 px-2 py-1"
                >
                  {village}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Filter by Taluka */}
        <select
          onChange={(e) => setSelectedTaluka(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Filter by Taluka</option>
          <option value="Taluka1">Taluka1</option>
          <option value="Taluka2">Taluka2</option>
        </select>

        {/* Filter by Department */}
        <select
          onChange={(e) => setSelectedDept(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Filter by Department</option>
          <option value="Education">Education</option>
          <option value="Health">Health</option>
        </select>

        {/* Apply Filters Button */}
        <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded">
          Apply Filters
        </button>
      </div>

      {/* Display Solar Requests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {solarRequests.length > 0 ? (
          solarRequests.map((request) => (
            <SolarCard key={request._id} request={request} />
          ))
        ) : (
          <p>No solar requests found.</p>
        )}
      </div>
    </div>
  );
};

export default Demands;
