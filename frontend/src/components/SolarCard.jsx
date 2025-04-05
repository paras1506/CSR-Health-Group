import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SolarCard = ({ request }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!request) return null;

  const handleDonateInterest = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/solar/donor-interest",
        { requestId: request._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(response.data.message);
    } catch (error) {
      console.error("Error showing interest:", error);
      alert(error.response?.data?.error || "Failed to register interest");
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-md shadow-lg rounded-lg p-4 border border-white/50 flex flex-col h-full text-white">
      {/* Card content */}
      <div className="flex-grow text-black">
        <h3 className="text-lg font-bold ">{request.organisationName}</h3>
        <p>{request.institutionType}</p>
        <p>
          {request.villageName}, {request.taluka}
        </p>
        <p className="text-sm ">
          Solar Demand: <strong>{request.solarDemand}</strong>
        </p>
      </div>
      {/* Button */}
      <button
        onClick={handleDonateInterest}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Interested to Donate
      </button>
    </div>
  );
};

export default SolarCard;
