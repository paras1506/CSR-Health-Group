import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VerifierDashboard = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "verifier") {
      navigate("/login"); // Redirect if not a verifier
    } else {
      fetchDonations();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchDonations = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/v1/donations/pending");
      setDonations(response.data.donations);
    } catch (err) {
      setError("Failed to load donations.");
      console.error("Error fetching donations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (donationId) => {
    try {
      await axios.put(`http://localhost:4000/api/v1/donations/verify/${donationId}`);
      setDonations(donations.filter((donation) => donation.id !== donationId)); // Remove verified donation
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Verifier Dashboard</h2>
        
        {error && <p className="text-red-600">{error}</p>}
        
        {loading ? (
          <p>Loading donations...</p>
        ) : donations.length === 0 ? (
          <p>No donations pending verification.</p>
        ) : (
          <ul>
            {donations.map((donation) => (
              <li key={donation.id} className="flex justify-between p-4 border-b">
                <div>
                  <p><strong>Donor:</strong> {donation.donorName}</p>
                  <p><strong>Amount:</strong> ${donation.amount}</p>
                  <p><strong>Status:</strong> {donation.status}</p>
                </div>
                <button
                  onClick={() => handleVerify(donation.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Verify
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VerifierDashboard;
