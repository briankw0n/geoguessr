let map, highlightLayer, allBordersLayer;
let countriesData = null;
let capitalData = null;
let flagData = null;
let currentFeature = null;
let currentCountry = "";
let currentCapital = "";
let currentCode = "";
let wrongAttempts = 0;
let currentMode = null;

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

function startCountryGame() {
  document.body.classList.remove("capital-mode");

  const features = countriesData.features;
  const randomIndex = Math.floor(Math.random() * features.length);
  currentFeature = features[randomIndex];
  currentCountry = currentFeature.properties.name;
  wrongAttempts = 0;

  document.getElementById("map").style.display = "block";
  document.getElementById("flagImg").style.display = "none";
  document.getElementById("prompt").textContent = "";

  highlightCountry(currentFeature);

  const resultEl = document.getElementById("result");
  resultEl.textContent = "";

  const guessInput = document.getElementById("guessInput");
  guessInput.value = "";
  guessInput.disabled = false;
  if (!isMobile()) {
    guessInput.focus();
  }
}

function startCapitalGame() {
  if (!capitalData || capitalData.length === 0) {
    alert("Capital data is unavailable.");
    return;
  }

  const randomEntry =
    capitalData[Math.floor(Math.random() * capitalData.length)];
  currentCountry = randomEntry.country;
  currentCapital = randomEntry.city;

  wrongAttempts = 0;

  document.getElementById("map").style.display = "none";
  document.getElementById("flagImg").style.display = "none";

  const promptEl = document.getElementById("prompt");
  promptEl.textContent = `What is the capital of ${currentCountry}?`;

  document.body.classList.add("capital-mode");

  const resultEl = document.getElementById("result");
  resultEl.textContent = "";

  const guessInput = document.getElementById("guessInput");
  guessInput.value = "";
  guessInput.disabled = false;
  if (!isMobile()) {
    guessInput.focus();
  }
}

function startFlagGame() {
  document.body.classList.remove("capital-mode");

  if (!flagData || flagData.length === 0) {
    alert("Flag data not loaded.");
    return;
  }

  const randomIndex = Math.floor(Math.random() * flagData.length);
  const countryObj = flagData[randomIndex];

  currentCountry = countryObj.country;
  currentCode = countryObj.code.toLowerCase();

  const flagUrl = `data/${currentCode}.svg`;

  wrongAttempts = 0;

  document.getElementById("map").style.display = "none";

  const flagImg = document.getElementById("flagImg");
  flagImg.style.display = "block";
  flagImg.src = flagUrl;
  flagImg.alt = `Flag of ${currentCountry}`;

  document.getElementById("prompt").textContent = "";
  document.getElementById("result").textContent = "";

  const guessInput = document.getElementById("guessInput");
  guessInput.value = "";
  guessInput.disabled = false;
  if (!isMobile()) {
    guessInput.focus();
  }
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

document.getElementById("guessInput").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();

  const guess = e.target.value.trim();
  const resultEl = document.getElementById("result");

  if (!guess) {
    alert("Please enter a guess!");
    return;
  }

  if (currentMode === "country") {
    if (guess.toLowerCase() === currentCountry.toLowerCase()) {
      resultEl.textContent = "✅ Correct!";
      e.target.disabled = true;
      setTimeout(startCountryGame, 1000);
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
        setTimeout(startCountryGame, 2000);
      }

      if (wrongAttempts < 3) {
        e.target.value = "";
        e.target.focus();
      }
    }
  } else if (currentMode === "capital") {
    if (!currentCapital) {
      resultEl.textContent = "⚠️ Capital data not available for this country.";
      return;
    }

    if (guess.toLowerCase() === currentCapital.toLowerCase()) {
      resultEl.textContent = "✅ Correct!";
      e.target.disabled = true;
      setTimeout(startCapitalGame, 1000);
    } else {
      wrongAttempts++;
      const firstLetter = currentCapital.charAt(0);
      const letterCount = currentCapital.length;

      if (wrongAttempts === 1) {
        resultEl.textContent = `❌ Hint: It starts with "${firstLetter}".`;
      } else if (wrongAttempts === 2) {
        resultEl.textContent = `❌ Hint: It starts with "${firstLetter}" and has ${letterCount} letters.`;
      } else {
        resultEl.textContent = `❌ The answer was: ${currentCapital}`;
        e.target.disabled = true;
        setTimeout(startCapitalGame, 2000);
      }

      if (wrongAttempts < 3) {
        e.target.value = "";
        e.target.focus();
      }
    }
  } else if (currentMode === "flag") {
    if (guess.toLowerCase() === currentCountry.toLowerCase()) {
      resultEl.textContent = "✅ Correct!";
      e.target.disabled = true;
      setTimeout(startFlagGame, 1000);
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
        setTimeout(startFlagGame, 2000);
      }

      if (wrongAttempts < 3) {
        e.target.value = "";
        e.target.focus();
      }
    }
  }
});

document.getElementById("modeCountry").addEventListener("click", () => {
  currentMode = "country";
  document.getElementById("menu").style.display = "none";
  document.getElementById("app").style.display = "flex";

  if (!map) {
    initMap();
  }

  fetch("country.json")
    .then((res) => res.json())
    .then((data) => {
      countriesData = data;
      drawAllBorders();
      startCountryGame();
    })
    .catch((err) => {
      alert("Failed to load country data.");
      console.error("GeoJSON load error:", err);
    });
});

document.getElementById("modeCapital").addEventListener("click", () => {
  currentMode = "capital";
  document.getElementById("menu").style.display = "none";
  document.getElementById("app").style.display = "flex";

  fetch("capital.json")
    .then((res) => res.json())
    .then((data) => {
      capitalData = data;
      startCapitalGame();
    })
    .catch((err) => {
      alert("Failed to load capital data.");
      console.error("Capital JSON load error:", err);
    });
});

document.getElementById("modeFlag").addEventListener("click", () => {
  currentMode = "flag";
  document.getElementById("menu").style.display = "none";
  document.getElementById("app").style.display = "flex";

  fetch("flag_extracted.json")
    .then((res) => res.json())
    .then((data) => {
      flagData = data;
      startFlagGame();
    })
    .catch((err) => {
      alert("Failed to load flag data.");
      console.error(err);
    });
});

document.getElementById("backBtn").addEventListener("click", () => {
  document.getElementById("app").style.display = "none";

  document.getElementById("menu").style.display = "flex";

  const guessInput = document.getElementById("guessInput");
  guessInput.value = "";
  guessInput.disabled = false;

  document.getElementById("result").textContent = "";
  document.getElementById("prompt").textContent = "";
  document.getElementById("flagImg").style.display = "none";
  document.getElementById("map").style.display = "none";

  currentMode = null;
  wrongAttempts = 0;
});

document.getElementById("refreshBtn").addEventListener("click", () => {
  if (!currentMode || !countriesData) return;

  switch (currentMode) {
    case "country":
      startCountryGame();
      break;
    case "capital":
      startCapitalGame();
      break;
    case "flag":
      startFlagGame();
      break;
  }
});
