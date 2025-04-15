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
  let resp = fetch(
    `https://api.openweathermap.org/data/2.5/find?q=${query}&appid=7c748e66ec4489f390a888a83eb4a0f4&units=metric`
  );
  let data = await resp.json();
  return data.list.map((item) => item.name);
}
