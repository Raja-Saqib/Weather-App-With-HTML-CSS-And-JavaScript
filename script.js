const apiKey = "YOUR_API_KEY_HERE";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

const weatherInfo = document.getElementById("weatherInfo");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const errorMsg = document.getElementById("errorMsg");

searchBtn.addEventListener("click", getWeather);

function getWeather() {
  const city = cityInput.value.trim();

  if (city === "") {
    errorMsg.textContent = "Please enter a city name.";
    weatherInfo.style.display = "none";
    return;
  }

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(data => {
      displayWeather(data);
      errorMsg.textContent = "";
    })
    .catch(() => {
      errorMsg.textContent = "City not found. Please try again.";
      weatherInfo.style.display = "none";
    });
}

function displayWeather(data) {
  cityName.textContent = data.name;
  temperature.textContent = `🌡️ ${data.main.temp} °C`;
  condition.textContent = `☁️ ${data.weather[0].description}`;
  humidity.textContent = `💧 Humidity: ${data.main.humidity}%`;
  wind.textContent = `🌬️ Wind: ${data.wind.speed} km/h`;

  weatherInfo.style.display = "block";
}
