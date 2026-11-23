
const apiKey = config.apiKey;

const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const cityInput = document.getElementById("cityInput");

const weatherInfo = document.getElementById("weatherInfo");
const cityName = document.getElementById("cityName");

const temperature = document.getElementById("temperature");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

// Default temperature unit
let selectedUnit = "C";

// Store original temperature in Celsius
let currentTemperatureCelsius = null;

const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const errorMsg = document.getElementById("errorMsg");
const loading = document.getElementById("loading");
const loadingText = document.getElementById("loadingText");
const statusMsg = document.getElementById("statusMsg");

// Event listeners
searchBtn.addEventListener("click", getWeather);
locationBtn.addEventListener("click", getCurrentLocation);

celsiusBtn.addEventListener("click", function () {
  changeTemperatureUnit("C");
});

fahrenheitBtn.addEventListener("click", function () {
  changeTemperatureUnit("F");
});

cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});

// Automatically detect location when application loads
window.addEventListener("load", getCurrentLocation);

// Display loading animation
function showLoading(message = "Loading weather...") {
  loadingText.textContent = message;

  loading.style.display = "flex";

  errorMsg.textContent = "";
  statusMsg.textContent = "";
  weatherInfo.style.display = "none";
}

// Hide loading animation
function hideLoading() {
  loading.style.display = "none";
}

// Centralized API error handling
function getApiErrorMessage(status, message = "") {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";

    case 401:
      return "Invalid API key. Please check your OpenWeather API configuration.";

    case 403:
      return "Access denied. Please check your API permissions.";

    case 404:
      return "City not found. Please enter a valid city name.";

    case 429:
      return "API request limit exceeded. Please try again later.";

    case 500:
    case 502:
    case 503:
    case 504:
      return "Weather service is temporarily unavailable. Please try again later.";

    default:
      return message || "Unable to retrieve weather information. Please try again.";
  }
}

// Reusable weather API request
async function fetchWeather(url) {
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error(
      "API_KEY_MISSING: Please configure your OpenWeather API key."
    );
  }

  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(
      "NETWORK_ERROR: Unable to connect. Check your internet connection."
    );
  }

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(response.status)
    );
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error(
      "INVALID_RESPONSE: Received an invalid response from the weather service."
    );
  }

  // Validate the expected weather response
  if (
    !data ||
    !data.main ||
    !data.weather ||
    !Array.isArray(data.weather) ||
    !data.weather[0] ||
    typeof data.main.temp !== "number" ||
    typeof data.main.humidity !== "number" ||
    !data.name ||
    !data.wind ||
    typeof data.wind.speed !== "number"
  ) {
    throw new Error(
      "INVALID_RESPONSE: Weather data is incomplete or invalid."
    );
  }

  return data;
}

// Display errors consistently
function displayError(error, fallbackMessage) {
  hideLoading();

  weatherInfo.style.display = "none";

  errorMsg.textContent = error.message || fallbackMessage;

  statusMsg.textContent =
    "Please try again or search for another city.";
}

// Get current location
function getCurrentLocation() {
  if (!navigator.geolocation) {
    errorMsg.textContent =
      "Geolocation is not supported by your browser.";

    statusMsg.textContent =
      "Please search for a city manually.";

    return;
  }

  showLoading("Detecting your location...");

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      await fetchWeatherByCoordinates(latitude, longitude);
    },

    function (error) {
      hideLoading();
      weatherInfo.style.display = "none";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg.textContent =
            "Location permission denied. Please allow location access.";
          break;

        case error.POSITION_UNAVAILABLE:
          errorMsg.textContent =
            "Location information is unavailable. Please try again.";
          break;

        case error.TIMEOUT:
          errorMsg.textContent =
            "Location request timed out. Please try again.";
          break;

        default:
          errorMsg.textContent =
            "Unable to detect your location.";
      }

      statusMsg.textContent =
        "You can still search for a city manually.";
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// Fetch weather using coordinates
async function fetchWeatherByCoordinates(latitude, longitude) {
  showLoading("Fetching your local weather...");

  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  try {
    const data = await fetchWeather(url);

    displayWeather(data);

    statusMsg.textContent =
      "Weather detected using your current location.";
  } catch (error) {
    displayError(error, "Unable to fetch your local weather.");
    console.error("Location weather error:", error);
  } finally {
    hideLoading();
  }
}

// Manual city search
async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    errorMsg.textContent = "Please enter a city name.";
    statusMsg.textContent = "";
    weatherInfo.style.display = "none";
    return;
  }

  showLoading(`Fetching weather for ${city}...`);

  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const data = await fetchWeather(url);

    displayWeather(data);

    statusMsg.textContent =
      "Weather retrieved using city search.";
  } catch (error) {
    displayError(error, "Unable to retrieve weather information.");
    console.error("City search error:", error);
  } finally {
    hideLoading();
  }
}

// Get weather icon based on OpenWeather condition codes
function getWeatherIcon(weatherId, iconCode) {

  // Thunderstorm
  if (weatherId >= 200 && weatherId < 300) {
    return "⛈️";
  }

  // Drizzle
  if (weatherId >= 300 && weatherId < 400) {
    return "🌦️";
  }

  // Rain
  if (weatherId >= 500 && weatherId < 600) {
    return "🌧️";
  }

  // Snow
  if (weatherId >= 600 && weatherId < 700) {
    return "❄️";
  }

  // Atmosphere: mist, smoke, haze, fog, etc.
  if (weatherId >= 700 && weatherId < 800) {
    return "🌫️";
  }

  // Clear sky
  if (weatherId === 800) {
    return iconCode && iconCode.endsWith("n")
      ? "🌙"
      : "☀️";
  }

  // Clouds
  if (weatherId > 800 && weatherId < 900) {
    if (weatherId === 801) {
      return "🌤️";
    }

    if (weatherId === 802) {
      return "⛅";
    }

    return "☁️";
  }

  // Fallback icon
  return "🌡️";
}

// Change temperature unit
function changeTemperatureUnit(unit) {

  selectedUnit = unit;

  // Update active button
  celsiusBtn.classList.toggle("active", unit === "C");
  fahrenheitBtn.classList.toggle("active", unit === "F");

  // Update temperature if weather data exists
  updateTemperatureDisplay();
}

// Update displayed temperature
function updateTemperatureDisplay() {

  if (currentTemperatureCelsius === null) {
    return;
  }

  let displayedTemperature;

  if (selectedUnit === "F") {

    displayedTemperature =
      (currentTemperatureCelsius * 9 / 5) + 32;

  } else {

    displayedTemperature = currentTemperatureCelsius;
  }

  temperature.textContent =
    `🌡️ ${displayedTemperature.toFixed(1)} °${selectedUnit}`;
}

// Display weather information
function displayWeather(data) {

  cityName.textContent = data.name;

  // Store original temperature in Celsius
  currentTemperatureCelsius = data.main.temp;

  // Display temperature using selected unit
  updateTemperatureDisplay();

  // Get weather condition
  const weatherId = data.weather[0].id;
  const iconCode = data.weather[0].icon;

  // Update dynamic weather icon
  weatherIcon.textContent =
    getWeatherIcon(weatherId, iconCode);

  condition.textContent =
    ` ${data.weather[0].description}`;

  humidity.textContent =
    `💧 Humidity: ${data.main.humidity}%`;

  wind.textContent =
    `🌬️ Wind: ${data.wind.speed} m/s`;

  weatherInfo.style.display = "block";

  errorMsg.textContent = "";
}



