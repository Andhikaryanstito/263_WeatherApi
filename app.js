const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

// Endpoint Geocoding Dinamis MapTiler
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
    const placeTypes = feature.place_type || [];

    let country = "-";
    let province = "-";
    let district = "-";

    // 1. Ekstrak data hierarki dari context (entitas induk di atasnya)
    if (feature.context && Array.isArray(feature.context)) {
      feature.context.forEach((item) => {
        if (item.id.startsWith("country")) country = item.text;
        if (item.id.startsWith("region") || item.id.startsWith("province")) {
          province = item.text;
        }
        if (
          item.id.startsWith("subregion") ||
          item.id.startsWith("district") ||
          item.id.startsWith("locality") ||
          item.id.startsWith("municipality")
        ) {
          district = item.text;
        }
      });
    }

    // 2. Evaluasi tipe entitas utama yang dicari
    if (placeTypes.includes("country")) {
      country = feature.text;
      province = "-";
      district = "-";
    } else if (
      placeTypes.includes("region") ||
      placeTypes.includes("province")
    ) {
      province = feature.text;
      district = "-";
    } else if (
      placeTypes.includes("natural") ||
      placeTypes.includes("island") ||
      placeTypes.includes("continent")
    ) {
      district = "-";
    } else {
      // Jika yang dicari setingkat kecamatan/kota/desa (seperti Kasihan, Bantul, Purworejo)
      if (district === "-") {
        district = feature.text;
      }
    }

    res.json({
      query: kota,
      lokasi: feature.text || kota,
      nama_lengkap: feature.place_name,
      negara: country,
      provinsi: province,
      kecamatan: district,
      koordinat: {
        longitude: lon,
        latitude: lat,
      },
    });
  } catch (error) {
    console.error("Error MapTiler API:", error.message);
    res.status(500).json({
      message: "Gagal mengambil data dari MapTiler",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});