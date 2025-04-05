import React, { useEffect, useState } from "react";
import axios from "axios";
import SolarCard from "../components/SolarCard";
import { useNavigate, useLocation } from "react-router-dom";

const Home = () => {
  const [solarRequests, setSolarRequests] = useState([]);
  const [searchVillage, setSearchVillage] = useState("");
  const [villageSuggestions, setVillageSuggestions] = useState([]);
  const [selectedTaluka, setSelectedTaluka] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [talukaOptions, setTalukaOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch Requests Function
  const fetchRequests = async (page = 1, taluka = "", dept = "", village = "") => {
    try {
      let url = `http://localhost:4000/api/v1/solar/all?page=${page}`;
      const params = [];
      if (taluka) params.push(`taluka=${taluka}`);
      if (dept) params.push(`institutionType=${dept}`);
      if (village) params.push(`village=${village}`);
      if (params.length > 0) url += `&${params.join("&")}`;

      const res = await axios.get(url);
      setSolarRequests(res.data.requests || []);
      setPagination(res.data.pagination || {});

      if (page === 1) {
        setTalukaOptions(
          (res.data.distinctTalukas || []).filter((t) => t && t !== "????").map((t) => t.trim())
        );
        setDepartmentOptions(res.data.distinctDepartments || []);
      }
    } catch (err) {
      console.error("Failed to fetch solar requests:", err);
    }
  };

  // Search Village Suggestions
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchVillage(query);

    if (query.length >= 2) {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/v1/solar/search-villages?query=${query}`
        );
        setVillageSuggestions(res.data || []);
      } catch (err) {
        console.error("Search error:", err);
      }
    } else {
      setVillageSuggestions([]);
    }
  };

  // Apply Filters
  const applyFilters = () => {
    const queryParams = new URLSearchParams();
    if (selectedTaluka) queryParams.set("taluka", selectedTaluka);
    if (selectedDept) queryParams.set("institutionType", selectedDept);
    if (searchVillage) queryParams.set("village", searchVillage);

    navigate(`/demands?${queryParams.toString()}`);
    fetchRequests(1, selectedTaluka, selectedDept, searchVillage);
  };

  // Clear Filters
  const clearFilters = () => {
    setSearchVillage("");
    setSelectedTaluka("");
    setSelectedDept("");
    navigate("/demands");
    fetchRequests(1, "", "", "");
  };

  // Pagination
  const goToPage = (page) => {
    fetchRequests(page, selectedTaluka, selectedDept, searchVillage);
  };

  // Read from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taluka = params.get("taluka") || "";
    const dept = params.get("institutionType") || "";
    const village = params.get("village") || "";

    setSelectedTaluka(taluka);
    setSelectedDept(dept);
    setSearchVillage(village);

    fetchRequests(1, taluka, dept, village);
  }, [location.search]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Solar Requests</h1>

      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Village Search */}
        <div className="relative">
          <input
            type="text"
            value={searchVillage}
            onChange={handleSearchChange}
            placeholder="Search village..."
            className="border px-2 py-1 rounded bg-white/40 backdrop-blur-md shadow-lg border-white/50"
          />
          {villageSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border mt-1 rounded shadow max-h-40 overflow-y-auto">
              {villageSuggestions.map((v, index) => (
                <li
                  key={index}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSearchVillage(v);
                    setVillageSuggestions([]);
                    applyFilters();
                  }}
                >
                  {v}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Taluka Dropdown */}
        <select
          value={selectedTaluka}
          onChange={(e) => setSelectedTaluka(e.target.value)}
          className="border px-2 py-1 rounded bg-white/20 backdrop-blur-md shadow-lg border-white/50"
        >
          <option value="">All Talukas</option>
          {talukaOptions.map((taluka, index) => (
            <option key={index} value={taluka}>
              {taluka}
            </option>
          ))}
        </select>

        {/* Department Dropdown */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border px-2 py-1 rounded bg-white/20 backdrop-blur-md shadow-lg border-white/50"
        >
          <option value="">All Departments</option>
          {departmentOptions.map((dept, index) => (
            <option key={index} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Apply Filters Button */}
        <button
          onClick={applyFilters}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>

      {/* Solar Request Cards */}
      {solarRequests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {solarRequests.map((req) => (
            <SolarCard key={req._id} request={req} />
          ))}
        </div>
      ) : (
        <p className="text-white">No requests found.</p>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center text-white mt-6 gap-2">
        {pagination.hasPrevPage && (
          <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
        )}
        <span className="px-3 py-1 border rounded text-black bg-white">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        {pagination.hasNextPage && (
          <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
