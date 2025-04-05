const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const SolarRequest = require("./model/solarRequest"); // Adjust path as needed

// Connect to MongoDB
mongoose.connect("mongodb+srv://parwanmarwo:q1qTalDvptMptAXD@cluster0.jnz5h8m.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

async function importCSV() {
  const results = [];

  fs.createReadStream("data.csv")
    .pipe(csv({
      headers: ['timestamp', 'district', 'villageName', 'taluka', 'institutionType', 'organisationName', 'solarDemand'],
      skipLines: 1 // Skip the header row if your CSV has one
    }))
    .on("data", (row) => {
      // Map CSV row to DB schema
      const cleanedRow = {
        organisationName: row.organisationName.trim(),
        institutionType: row.institutionType.trim(),
        villageName: row.villageName.trim(),
        taluka: row.taluka.trim(),
        district: row.district.trim(),
        solarDemand: parseFloat(row.solarDemand.replace(/[^\d.]/g, "")) || 0,
      };

      results.push(cleanedRow);
    })
    .on("end", async () => {
      try {
        await SolarRequest.insertMany(results);
        console.log("Data imported successfully!");
      } catch (error) {
        console.error("Error importing CSV:", error);
      } finally {
        mongoose.connection.close();
      }
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
    });
}

importCSV();
