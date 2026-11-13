const apiKey = config.apiKey;

const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const cityInput = document.getElementById("cityInput");

const weatherInfo = document.getElementById("weatherInfo");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const errorMsg = document.getElementById("errorMsg");
const loading = document.getElementById("loading");
const statusMsg = document.getElementById("statusMsg");

// Event listeners
searchBtn.addEventListener("click", getWeather);
locationBtn.addEventListener("click", getCurrentLocation);

cityInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    getWeather();
  }
});

// Automatically detect location when application loads
window.addEventListener("load", function() {
  getCurrentLocation();
});

// Loading indicator
function showLoading(message = "Loading weather...") {
  loading.textContent = message;
  loading.style.display = "block";

  errorMsg.textContent = "";
  statusMsg.textContent = "";
  weatherInfo.style.display = "none";
}

// Hide loading indicator
function hideLoading() {
  loading.style.display = "none";
}

// Fetch weather using latitude and longitude
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

    // Location successfully retrieved
    function(position) {

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      showLoading("Fetching your local weather...");

      fetchWeatherByCoordinates(latitude, longitude);
    },

    // Handle location errors
    function(error) {

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

    // Geolocation options
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// Fetch weather using coordinates
function fetchWeatherByCoordinates(latitude, longitude) {

  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  fetch(url)

    .then(response => {

      if (!response.ok) {
        throw new Error("Unable to fetch weather data.");
      }

      return response.json();
    })

    .then(data => {

      displayWeather(data);

      statusMsg.textContent =
        "Weather detected using your current location.";

      hideLoading();
    })

    .catch(error => {

      hideLoading();

      errorMsg.textContent =
        "Unable to fetch your local weather. Please try again.";

      statusMsg.textContent =
        "You can search for a city manually.";

      console.error(error);
    });
}

// Manual city search
function getWeather() {

  const city = cityInput.value.trim();

  if (city === "") {
    errorMsg.textContent = "Please enter a city name.";
    weatherInfo.style.display = "none";
    return;
  }

  showLoading("Fetching weather for " + city + "...");

  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  fetch(url)

    .then(response => {

      if (!response.ok) {
        throw new Error("City not found");
      }

      return response.json();
    })

    .then(data => {

      displayWeather(data);

      statusMsg.textContent =
        "Weather retrieved using city search.";

      hideLoading();
    })

    .catch(error => {

      hideLoading();

      errorMsg.textContent =
        "City not found. Please try again.";

      weatherInfo.style.display = "none";

      console.error(error);
    });
}

// Display weather information
function displayWeather(data) {
  const total;

  cityName.textContent = data.name;

  temperature.textContent =
    `🌡️ ${data.main.temp} °C`;

  condition.textContent =
    `☁️ ${data.weather[0].description}`;

  humidity.textContent =
    `💧 Humidity: ${data.main.humidity}%`;

  wind.textContent =
    `🌬️ Wind: ${data.wind.speed} m/s`;

  weatherInfo.style.display = "block";

  errorMsg.textContent = "";
}


