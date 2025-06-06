const SolarRequest = require("../model/solarRequest");
const { sendMail } = require("../utils/verifyAndSendMail");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ✅ Create Solar Request (Appealer)
exports.createRequest = async (req, res) => {
  try {
    console.log(req.user);

    if (!req.user.isVerified) {
      return res.status(403).json({ error: "User not verified." });
    }

    const {
      organisationName,
      institutionType,
      villageName,
      taluka,
      solarDemand,
      district,
    } = req.body;

    if (
      !organisationName ||
      !institutionType ||
      !villageName ||
      !taluka ||
      !solarDemand ||
      !district
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const request = new SolarRequest({
      ...req.body,
      userId: req.user.userId,
    });

    await request.save();
    res.status(201).json({ message: "Request created successfully", request });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create request", details: error.message });
  }
};

// ✅ Get All Solar Requests (Public/Home Page)
exports.getAllRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      taluka,
      institutionType,
      village,
    } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
    };

    const filters = {};
    if (taluka) filters.taluka = taluka;
    if (institutionType) filters.institutionType = institutionType;
    if (village) filters.villageName = { $regex: village, $options: "i" };

    const aggregatePipeline = [];

    if (Object.keys(filters).length > 0) {
      aggregatePipeline.push({ $match: filters });
    }

    aggregatePipeline.push({
      $project: {
        organisationName: 1,
        institutionType: 1,
        villageName: 1,
        taluka: 1,
        solarDemand: 1,
        fulfillmentPercentage: 1,
        createdAt: 1,
      },
    });

    const aggregate = SolarRequest.aggregate(aggregatePipeline);

    const paginatedResult = await SolarRequest.aggregatePaginate(
      aggregate,
      options
    );

    const distinctTalukas = await SolarRequest.distinct("taluka");
    const distinctDepartments = await SolarRequest.distinct("institutionType");

    return res.json({
      pagination: {
        totalItems: paginatedResult.totalDocs,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.page,
        hasNextPage: paginatedResult.hasNextPage,
        hasPrevPage: paginatedResult.hasPrevPage,
        nextPage: paginatedResult.nextPage,
        prevPage: paginatedResult.prevPage,
      },
      requests: paginatedResult.docs,
      distinctTalukas,
      distinctDepartments,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch requests", details: error.message });
  }
};

// ✅ Search by Village Name (Public)
exports.searchVillages = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const villages = await SolarRequest.aggregate([
      {
        $match: {
          villageName: { $regex: query, $options: "i" },
        },
      },
      {
        $group: {
          _id: "$villageName",
        },
      },
      {
        $limit: 10,
      },
    ]);

    const villageNames = villages.map((v) => v._id);

    res.json(villageNames);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to search villages", details: error.message });
  }
};

// ✅ Filter by Department (Public)
exports.filterByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.query;
    if (!departmentId)
      return res.status(400).json({ error: "Department ID is required." });

    const results = await SolarRequest.find({ departmentId }).select("-donors");
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Filtering failed", details: error.message });
  }
};

// ✅ Donor Shows Interest (Authenticated Donors Only)
exports.donorInterest = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId)
      return res.status(400).json({ error: "Request ID is required." });

    const request = await SolarRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found." });

    // Add donor's details
    await SolarRequest.findByIdAndUpdate(requestId, {
      $addToSet: {
        donors: {
          donorId: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
        },
      },
    });

    await sendMail(
      req.user.email,
      "Interest Registered - Vardaan CSR Portal",
      `
        <div style="text-align:center;">
          <img src="https://zpsangli.com/mr/img/Sangli_ZP.jpg" alt="Zilha Parishad Sangli" style="max-width:200px; margin-bottom: 20px;" />
        </div>
    
        <h2 style="text-align:center;">Thank You for Showing Interest, ${req.user.fname}!</h2>
        <p style="text-align:center; color:#888; font-style:italic; margin-top:-10px;">Rural Development through Aid and Assistance Network</p>
    
        <p>We appreciate your willingness to support a noble cause through <strong>Vardaan</strong>, the official Corporate Social Responsibility (CSR) platform by <strong>Zilha Parishad Sangli</strong>.</p>
    
        <p>You have shown interest in the solar requirement raised by <strong>${request.organisationName}</strong>. Your engagement is a vital step towards empowering rural institutions and making a tangible difference.</p>
    
        <p>Our team and the institute will reach out to you soon with further details and next steps.</p>
    
        <hr/>
    
        <p style="color:#555;">If you have any questions or need help, feel free to reach us at <a href="mailto:support@zpsngvardaan.in">support@zpsngvardaan.in</a>.</p>
    
        <p style="margin-top:30px;">Warm regards,<br/>
        <strong>Team Vardaan<br/>Zilha Parishad Sangli</strong></p>
      `
    );

    res.json({ message: "Interest recorded successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to register interest", details: error.message });
  }
};

// ✅ Department Head Updates Fulfillment
exports.updateFulfillment = async (req, res) => {
  try {
    const { requestId, fulfillmentPercentage } = req.body;
    if (!requestId || fulfillmentPercentage == null)
      return res
        .status(400)
        .json({ error: "Request ID and fulfillment percentage are required." });

    const request = await SolarRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found." });

    await SolarRequest.findByIdAndUpdate(
      requestId,
      { fulfillmentPercentage },
      { new: true }
    );

    res.json({ message: "Fulfillment updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update fulfillment", details: error.message });
  }
};

// ✅ Department Head Views Donor Details for Their Department
exports.getInterestedDonors = async (req, res) => {
  try {
    const { departmentId } = req.user; // Get department from the logged-in user

    if (!departmentId) {
      return res
        .status(403)
        .json({ error: "Access denied. You are not a Department Head." });
    }

    // Find all solar requests under the department & return donor details
    const requests = await SolarRequest.find({ departmentId })
      .populate("donors.donorId", "name email phone") // Fetch donor details
      .select("organisationName donors"); // Select only required fields

    res.json(requests);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch donor details", details: error.message });
  }
};

const User = require("../model/user"); // Import User model

// ✅ Verifier verifies an Appealer
exports.verifyAppealer = async (req, res) => {
  try {
    const { appealerId } = req.body;

    if (!appealerId) {
      return res.status(400).json({ error: "Appealer ID is required." });
    }

    const appealer = await User.findById(appealerId);
    if (!appealer) {
      return res.status(404).json({ error: "Appealer not found." });
    }

    if (appealer.role !== "Appealer") {
      return res.status(400).json({ error: "User is not an Appealer." });
    }

    appealer.isVerified = true;
    await appealer.save();

    res.json({ message: "Appealer verified successfully.", appealer });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Verification failed", details: error.message });
  }
};
