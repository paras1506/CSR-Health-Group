import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const DepartmentDashboard = () => {
  const { user } = useContext(AuthContext); // Get logged-in user details
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch all requests assigned to the department head
  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/v1/requests");
      setRequests(response.data.requests);
    } catch (err) {
      setError("Failed to load requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update fulfillment status
  const updateFulfillment = async (requestId, isFulfilled) => {
    try {
      await axios.put(`http://localhost:4000/api/v1/requests/${requestId}`, {
        fulfilled: isFulfilled,
      });

      // Update state after change
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, fulfilled: isFulfilled } : req
        )
      );
    } catch (err) {
      console.error("Error updating fulfillment:", err);
    }
  };

  // Remove fulfilled request from DB
  const deleteRequest = async (requestId) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/requests/${requestId}`);
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error deleting request:", err);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Department Dashboard</h2>
      
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <div key={request._id} className="border p-4 rounded-lg shadow-md bg-white">
              <h3 className="text-lg font-semibold">{request.title}</h3>
              <p className="text-gray-600">{request.description}</p>

              <h4 className="font-semibold mt-3">Interested Donors:</h4>
              {request.donors.length === 0 ? (
                <p className="text-sm text-gray-500">No donors yet</p>
              ) : (
                <ul className="list-disc ml-4">
                  {request.donors.map((donor) => (
                    <li key={donor._id} className="text-sm">
                      {donor.name} - {donor.email}
                    </li>
                  ))}
                </ul>
              )}

              {/* Toggle fulfillment status */}
              <button
                className={`mt-4 px-4 py-2 text-white rounded ${
                  request.fulfilled ? "bg-green-500" : "bg-blue-500"
                }`}
                onClick={() => updateFulfillment(request._id, !request.fulfilled)}
              >
                {request.fulfilled ? "Mark as Unfulfilled" : "Mark as Fulfilled"}
              </button>

              {/* Remove fulfilled requests */}
              {request.fulfilled && (
                <button
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => deleteRequest(request._id)}
                >
                  Remove Request
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentDashboard;
