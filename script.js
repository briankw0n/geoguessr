let map, highlightLayer, allBordersLayer;
let countriesData = null;
let currentFeature = null;
let currentCountry = "";
let wrongAttempts = 0;

function initMap() {
  map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 5,
    attributionControl: false,
  });

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; ' +
        '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  ).addTo(map);
}

function drawAllBorders() {
  if (allBordersLayer) {
    map.removeLayer(allBordersLayer);
  }

  allBordersLayer = L.geoJSON(countriesData, {
    style: {
      color: "#888",
      weight: 1,
      fillOpacity: 0,
    },
  }).addTo(map);
}

function highlightCountry(feature) {
  if (highlightLayer) {
    map.removeLayer(highlightLayer);
  }

  highlightLayer = L.geoJSON(feature, {
    style: {
      color: "transparent",
      weight: 0,
      fillColor: "#ff4444",
      fillOpacity: 0.7,
    },
  }).addTo(map);

  map.fitBounds(highlightLayer.getBounds(), { maxZoom: 5 });
}

function startGame() {
  const features = countriesData.features;
  const randomIndex = Math.floor(Math.random() * features.length);
  currentFeature = features[randomIndex];
  currentCountry = currentFeature.properties.name;
  wrongAttempts = 0;

  highlightCountry(currentFeature);

  document.getElementById("result").textContent = "";
  const guessInput = document.getElementById("guessInput");
  guessInput.value = "";
  guessInput.disabled = false;
  guessInput.focus();
}

document.getElementById("guessInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const guess = e.target.value.trim();
    const resultEl = document.getElementById("result");

    if (!guess) {
      alert("Please enter a guess!");
      return;
    }

    if (guess.toLowerCase() === currentCountry.toLowerCase()) {
      resultEl.textContent = "✅ Correct!";
      e.target.disabled = true;
      setTimeout(startGame, 1000);
    } else {
      wrongAttempts++;

      const firstLetter = currentCountry.charAt(0);
      const letterCount = currentCountry.length;

      if (wrongAttempts === 1) {
        resultEl.textContent = `❌ Hint: It starts with "${firstLetter}".`;
      } else if (wrongAttempts === 2) {
        resultEl.textContent = `❌ Hint: It starts with "${firstLetter}" and has ${letterCount} letters.`;
      } else {
        resultEl.textContent = `❌ The answer was: ${currentCountry}`;
        e.target.disabled = true;
        setTimeout(startGame, 2000);
      }

      if (wrongAttempts < 3) {
        e.target.value = "";
        e.target.focus();
      }
    }
  }
});

initMap();

fetch(
  "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
)
  .then((res) => res.json())
  .then((data) => {
    countriesData = data;
    drawAllBorders();
    startGame();
  })
  .catch((err) => {
    alert("Failed to load country data.");
    console.error("GeoJSON load error:", err);
  });