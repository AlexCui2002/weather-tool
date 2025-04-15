const defaultLocations = ["London", "New York", "Tokyo", "Paris", "Beijing"];
let debounceTimeout;

function loadPage() {
  populateDefaultLocations();
  loadDefaultWeather();
}

function populateDefaultLocations() {
  const locationsList = document.getElementById("locationsList");
  defaultLocations.forEach((location) => {
    const listItem = document.createElement("li");
    listItem.textContent = location;
    listItem.onclick = () => onLoadCity({ city: location });
    locationsList.appendChild(listItem);
  });
}

function loadDefaultWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      onLoadCity({ lat: latitude, lon: longitude });
    });
  } else {
    onLoadCity({ city: "London" });
  }
}

function debouncedSearch() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const city = document.getElementById("cityInput").value;
    if (!city) {
      document.getElementById("searchSuggestions").innerHTML = "";
    } else if (city.length < 3) {
      document.getElementById("searchSuggestions").innerHTML =
        "<li>Enter at least 3 characters</li>";
    } else {
      displaySuggestions(city);
    }
  }, 500);
}

document.querySelector("#cityInput").addEventListener("keyup", debouncedSearch);

function fetchSuggestions(query) {
  fetch(
    `https://api.openweathermap.org/data/2.5/find?q=${query}&appid=7c748e66ec4489f390a888a83eb4a0f4&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const suggestions = data.list.map((item) => item.name);
      displaySuggestions(suggestions);
    })
    .catch((error) => console.error("Error fetching suggestions:", error));
}

async function displaySuggestions(city) {
  try {
    let suggestions = await fetchSuggestions(city);

    if (!suggestions || suggestions.length === 0) {
      document.getElementById("searchSuggestions").innerHTML =
        "<li>No Result!</li>";
      return;
    }

    const suggestionsList = document.getElementById("searchSuggestions");
    suggestionsList.innerHTML = "";
    suggestions.forEach((city) => {
      const suggestionItem = document.createElement("li");
      suggestionItem.textContent = city;
      suggestionItem.onclick = () => {
        document.getElementById("cityInput").value = city;
        document.getElementById("searchSuggestions").innerHTML = "";
        onLoadCity({ city });
      };
      suggestionsList.appendChild(suggestionItem);
    });
  } catch (error) {
    console.error("Error displaying suggestions:", error);
  }
}

function onLoadCity(options) {
  const loading = document.getElementById("loading");
  const weatherInfo = document.getElementById("weatherInfo");

  loading.style.display = "flex";
  weatherInfo.innerHTML = "";
  forecastList.innerHTML = "";

  fetchWeather(options)
    .then((data) => {
      loading.style.display = "none";

      // Display main weather info
      const mainCard = document.createElement("div");
      mainCard.className = "weather-card";
      mainCard.innerHTML = `
                        <h2>${data.city} - ${data.country}</h2>
                        <img src="${data.currentWeather.icon}" alt="Weather Icon">
                        <p>${data.currentWeather.description}</p>
                        <p>Temperature: ${data.currentWeather.temperature}°C</p>
                        <p>Humidity: ${data.currentWeather.humidity}%</p>
                        <p>Wind Speed: ${data.currentWeather.windSpeed} m/s</p>
                    `;

      data.forecast.forEach((forecast) => {
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";
        forecastCard.innerHTML = `
                            <p>${forecast.time}</p>
                            <img src="${forecast.icon}" alt="Forecast Icon">
                            <p>${forecast.description}</p>
                            <p>Temp: ${forecast.temperature}°C</p>
                        `;
        forecastList.appendChild(forecastCard);
      });

      weatherInfo.appendChild(mainCard);
    })
    .catch((error) => {
      loading.style.display = "none";
      alert("Failed to fetch weather data. Please try again.");
    });
}

async function fetchWeather(options) {
  let url = "https://api.openweathermap.org/data/2.5/forecast";
  if (options.city) {
    url += `?q=${options.city}`;
  } else if (options.lat && options.lon) {
    url += `?lat=${options.lat}&lon=${options.lon}`;
  } else {
    throw new Error("Invalid options");
  }
  url += "&appid=7c748e66ec4489f390a888a83eb4a0f4";

  let resp = await fetch(url);
  let data = await resp.json();

  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        city: data.city.name,
        country: data.city.country,
        currentWeather: {
          description: data.list[0].weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`,
          temperature: data.list[0].main.temp,
          humidity: data.list[0].main.humidity,
          windSpeed: data.list[0].wind.speed,
        },
        forecast: data.list.slice(1, 6).map((item) => ({
          time: item.dt_txt,
          description: item.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          temperature: item.main.temp,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
        })),
      });
    }, 1000)
  );
}

async function fetchSuggestions(query) {
  let resp = await fetch(
    `https://api.openweathermap.org/data/2.5/find?q=${query}&appid=7c748e66ec4489f390a888a83eb4a0f4&units=metric`
  );
  let data = await resp.json();
  return data.list.map((item) => item.name);
}
