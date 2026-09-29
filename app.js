const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware melayani file statis frontend
app.use(express.static(path.join(__dirname, "public")));

// Route dasar endpoint lokasi
app.get("/api/lokasi", async (req, res) => {
  const kota = req.query.q || "Kasihan";
  res.json({ message: "Endpoint lokasi aktif", query: kota });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});