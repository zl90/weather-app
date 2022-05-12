/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import "./style.css";
import format from "date-fns";
import BackgroundImage from "./background.jpg";
import Favicon from "./favicon-32x32.png";

/*
-*''^`^''*-..,_,..-*''^`^''*-..,_,..-*''^`^''*-..,_,..-*''^`^''*-

[X] Set up a blank HTML document with the appropriate links to your JavaScript and CSS files.

[X] Write the functions that hit the API. You’re going to want functions that can take a location and return the weather data for that location. For now, just console.log() the information.

[X] Write the functions that process the JSON data you’re getting from the API and return an object with only the data you require for your app.

[X] Set up a simple form that will let users input their location and will fetch the weather info (still just console.log() it).

[ ] Display the information on your webpage!

[ ] Add any styling you like!

[ ] Optional: add a ‘loading’ component that displays from the time the form is submitted until the information comes back from the API.
    
[ ] Push that baby to github and share your solution below!

*/

// DOM nodes
const form1 = document.querySelector(".form-1");
const searchbar = document.querySelector(".searchbar");
const searchbarButton = document.querySelector(".searchbar-button");
const feelsLikeDisplay = document.querySelector(
  ".weather-details:nth-child(1) .weather-details-data"
);
const humidityDisplay = document.querySelector(
  ".weather-details:nth-child(2) .weather-details-data"
);
const windSpeedDisplay = document.querySelector(
  ".weather-details:nth-child(3) .weather-details-data"
);
const pressureDisplay = document.querySelector(
  ".weather-details:nth-child(4) .weather-details-data"
);
const descriptionDisplay = document.querySelector(".weather-info-description");
const cityDisplay = document.querySelector(".weather-info-city");
const dateDisplay = document.querySelector(".weather-info-date");
const timeDisplay = document.querySelector(".weather-info-time");
const temperatureDisplay = document.querySelector(".weather-info-temperature");
const unitsButton = document.querySelector(".weather-info-units");
const weatherIcon = document.querySelector(".weather-info-icon>i");

console.log(weatherIcon);

// State
const units = "metric";

// Singleton to hold the current weather data.
// Only need one of these for Todays weather.
const WeatherToday = ((
  city = "",
  country = "",
  main = "",
  temperature = 0,
  feelslike = 0,
  description = "",
  humidity = 0,
  windSpeed = 0,
  pressure = 0
) => {
  const setProperties = (data) => {
    WeatherToday.city = data.name;
    WeatherToday.country = data.sys.country;
    WeatherToday.temperature = data.main.temp;
    WeatherToday.feelslike = data.main.feels_like;
    WeatherToday.description = data.weather[0].description;
    WeatherToday.main = data.weather[0].main;
    WeatherToday.humidity = data.main.humidity;
    WeatherToday.pressure = data.main.pressure; // note: pressure is in hPa
    if (units === "metric") {
      // Convert Meters/second to Kilometers/hour
      WeatherToday.windSpeed = (data.wind.speed * 3.6).toFixed(2);
    } else if (units === "imperial") {
      // Imperial units already show Miles/hour
      WeatherToday.windSpeed = data.wind.speed;
    }
  };

  return {
    city,
    country,
    main,
    temperature,
    feelslike,
    description,
    humidity,
    windSpeed,
    pressure,
    setProperties,
  };
})();

const setFavicons = (favImg) => {
  const headTitle = document.querySelector("head");
  const setFavicon = document.createElement("link");
  setFavicon.setAttribute("rel", "shortcut icon");
  setFavicon.setAttribute("href", favImg);
  headTitle.appendChild(setFavicon);
};

// Injects variables into the API request.
const buildURL = (cityName) =>
  `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${units}&APPID=94bcd9b6ca50aef9b00d3ba7c664ea47`;

// Replaces whitespace with "+" to conform to the API standard.
const formatCityName = (cityName) => cityName.replaceAll(" ", "+");

// Makes a request to the Open Weather API for today's weather info.
const getTodaysWeatherData = async (cityName) => {
  try {
    const formattedCityName = formatCityName(cityName);
    const url = buildURL(formattedCityName);

    const response = await fetch(url, { mode: "cors" });

    if (response.status === 200) {
      const data = await response.json();
      console.log(data);
      WeatherToday.setProperties(data);
    } else {
      throw response;
    }
  } catch (error) {
    console.log(error);
    if (error.status === 404) {
      // Use Constraint Validation API here. Let the user know
      // that their city cannot be found.
      searchbar.value = "";
      searchbar.setCustomValidity("City not found.");
      searchbar.reportValidity();
    } else if (error.status === 400) {
      searchbar.setCustomValidity("Please enter a valid city name.");
      searchbar.reportValidity();
    }
  }
};

const submitForm = (event) => {
  event.preventDefault();
  getTodaysWeatherData(searchbar.value);
  console.log(WeatherToday);
};

const clearSearchbar = () => {
  searchbar.setCustomValidity("");
};

// Events
form1.addEventListener("submit", submitForm);
searchbar.addEventListener("input", clearSearchbar);

// Displaying information on the DOM

setFavicons(Favicon);
getTodaysWeatherData("Albion Park Rail");
console.log(WeatherToday);
