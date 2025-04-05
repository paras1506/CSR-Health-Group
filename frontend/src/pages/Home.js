import React, { useEffect, useState } from "react";
import axios from "axios";
import SolarCard from "../components/SolarCard";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [solarRequests, setSolarRequests] = useState([]);
  const [searchVillage, setSearchVillage] = useState("");
  const [villageSuggestions, setVillageSuggestions] = useState([]);
  const [selectedTaluka, setSelectedTaluka] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const navigate = useNavigate();

  const fetchRequests = async (page = 1) => {
    try {
      let url = `http://localhost:4000/api/v1/solar/all?page=${page}`;
      const res = await axios.get(url);
      setSolarRequests(res.data.requests || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error("Failed to fetch solar requests:", err);
    }
  };

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

  const applyFilters = async () => {
    let url = `http://localhost:4000/api/v1/solar/filter?page=${pagination.currentPage}`;
    const params = [];
    if (selectedTaluka) params.push(`taluka=${selectedTaluka}`);
    if (selectedDept) params.push(`department=${selectedDept}`);
    if (params.length > 0) url += `&${params.join("&")}`;

    try {
      const res = await axios.get(url);
      setSolarRequests(res.data.requests || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error("Filter error:", err);
    }
  };

  const goToPage = (page) => {
    fetchRequests(page);
  };

  useEffect(() => {
    fetchRequests(1);
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Solar Requests</h1>

      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Search by Village */}
        <div className="flex flex-col relative">
          <input
            type="text"
            value={searchVillage}
            onChange={handleSearchChange}
            placeholder="Search by village"
            className="p-2 border rounded"
          />
          {villageSuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border mt-1 rounded shadow p-2 w-full">
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
          <option value="Jat">Jat</option>
          <option value="Miraj">Miraj</option>
          <option value="Kavthe Mahankal">Kavthe Mahankal</option>
          <option value="Tasgaon">Tasgaon</option>
          <option value="Palus">Palus</option>
        </select>

        {/* Filter by Department */}
        <select
          onChange={(e) => setSelectedDept(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Filter by Department</option>
          <option value="Education">Education</option>
          <option value="Health">Health</option>
          <option value="Women and Child">Women and Child</option>
        </select>

        {/* Apply Filters Button */}
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Apply Filters
        </button>
      </div>

      {/* Display Solar Requests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {solarRequests.length > 0 ? (
          solarRequests.map((request, index) => (
            <SolarCard key={index} request={request} />
          ))
        ) : (
          <p className="text-gray-600">No solar requests found.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 items-center">
        <button
          disabled={!pagination.hasPrevPage}
          onClick={() => goToPage(pagination.currentPage - 1)}
          className={`px-4 py-2 rounded ${
            pagination.hasPrevPage ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Prev
        </button>

        <span className="font-medium text-white">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>

        <button
          disabled={!pagination.hasNextPage}
          onClick={() => goToPage(pagination.currentPage + 1)}
          className={`px-4 py-2 rounded ${
            pagination.hasNextPage ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;
