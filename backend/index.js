
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Proof of Taste backend is running!"
  });
});

app.listen(PORT, () => {
  console.log(`Proof of Taste backend running at http://localhost:${PORT}`);
});