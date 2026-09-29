const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

// Endpoint Geocoding Dinamis MapTiler
app.get("/api/lokasi", async (req, res) => {
  const kota = req.query.q || "Yogyakarta";
  const apiKey = "cwKFPH9KLLokX8G9txlx"; // API Key resmi milikmu
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (!data.features || data.features.length === 0) {
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    }

    const feature = data.features[0];
    const [lon, lat] = feature.geometry.coordinates;

    let country = "-";
    let province = "-";
    let district = "-";

    if (feature.context && Array.isArray(feature.context)) {
      feature.context.forEach((item) => {
        if (item.id.startsWith("country")) country = item.text;
        if (item.id.startsWith("region") || item.id.startsWith("province")) province = item.text;
        if (item.id.startsWith("subregion") || item.id.startsWith("district") || item.id.startsWith("locality")) district = item.text;
      });
    }

    const placeType = feature.place_type || [];
    if (placeType.includes("country")) country = feature.text;
    if (placeType.includes("region") || placeType.includes("province")) province = feature.text;
    if (placeType.includes("subregion") || placeType.includes("district") || placeType.includes("locality")) district = feature.text;

    res.json({
      query: kota,
      lokasi: feature.text || kota,
      nama_lengkap: feature.place_name,
      negara: country !== "-" ? country : "Indonesia",
      provinsi: province !== "-" ? province : "Daerah Istimewa Yogyakarta",
      kecamatan: district !== "-" ? district : (feature.place_name.split(",")[0] || kota),
      koordinat: {
        longitude: lon,
        latitude: lat
      }
    });
  } catch (error) {
    console.error("Error MapTiler API:", error.message);
    res.status(500).json({
      message: "Gagal mengambil data dari MapTiler",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});