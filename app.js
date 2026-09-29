const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/lokasi", async (req, res) => {
  const kota = req.query.q || "Kasihan";
  const apiKey = "cwKFPH9KLLokX8G9txlx";
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (!data.features || data.features.length === 0) {
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    }

    const feature = data.features[0];
    const [lon, lat] = feature.geometry.coordinates;

    res.json({
      query: kota,
      lokasi: feature.text || kota,
      koordinat: {
        longitude: lon,
        latitude: lat,
      },
    });
  } catch (error) {
    console.error("Error MapTiler API:", error.message);
    res.status(500).json({ message: "Gagal mengambil data dari MapTiler" });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});