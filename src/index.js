/* eslint-disable no-useless-escape */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import "./style.css";
import { format, add } from "date-fns";
import BackgroundImage from "./background.jpg";
import Favicon from "./favicon-32x32.png";
import Icons from "./icons";

/*
-*''^`^''*-..,_,..-*''^`^''*-..,_,..-*''^`^''*-..,_,..-*''^`^''*-

[X] Set up a blank HTML document with the appropriate links to your JavaScript and CSS files.

[X] Write the functions that hit the API. You’re going to want functions that can take a location and return the weather data for that location. For now, just console.log() the information.

[X] Write the functions that process the JSON data you’re getting from the API and return an object with only the data you require for your app.

[X] Set up a simple form that will let users input their location and will fetch the weather info (still just console.log() it).

[~] Display the information on your webpage!
    [ ] Get icons working.

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

// State
const units = "metric";
const defaultCity = "Sydney";

const capitalize = (str) => {
  const result = str.charAt(0).toUpperCase() + str.slice(1, str.length);
  return result;
};

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
  pressure = 0,
  timezone = 0
) => {
  const setProperties = (data) => {
    WeatherToday.city = data.name;
    WeatherToday.country = data.sys.country;
    WeatherToday.temperature = data.main.temp.toFixed(1);
    WeatherToday.feelslike = data.main.feels_like.toFixed(1);
    WeatherToday.description = data.weather[0].description;
    WeatherToday.main = data.weather[0].main;
    WeatherToday.humidity = data.main.humidity;
    WeatherToday.pressure = data.main.pressure; // note: pressure is in hPa
    WeatherToday.timezone = data.timezone;
    if (units === "metric") {
      // Convert Meters/second to Kilometers/hour
      WeatherToday.windSpeed = (data.wind.speed * 3.6).toFixed(1);
    } else if (units === "imperial") {
      // Imperial units already show Miles/hour
      WeatherToday.windSpeed = data.wind.speed.toFixed(1);
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
    timezone,
    setProperties,
  };
})();

// Displaying information on the DOM
const DisplayController = (() => {
  const displayAllData = () => {
    descriptionDisplay.textContent = capitalize(WeatherToday.description);
    cityDisplay.textContent = `${WeatherToday.city}, ${WeatherToday.country}`;

    if (units === "metric") {
      temperatureDisplay.textContent = `${WeatherToday.temperature} °C`;
      feelsLikeDisplay.textContent = `${WeatherToday.feelslike} °C`;
      windSpeedDisplay.textContent = `${WeatherToday.windSpeed} km/h`;
      unitsButton.textContent = "Display °F";
    } else {
      temperatureDisplay.textContent = `${WeatherToday.temperature} °F`;
      feelsLikeDisplay.textContent = `${WeatherToday.feelslike} °F`;
      windSpeedDisplay.textContent = `${WeatherToday.windSpeed} mph`;
      unitsButton.textContent = "Display °C";
    }

    // The local time is returned as an integer representing the shift
    // in seconds from UTC time. So I'll need to get the current time
    // in UTC, then add the amount of seconds to it.
    const dateInUTC = new Date().toUTCString();
    const dateInLocal = add(Date.parse(dateInUTC), {
      // API seems to be returning incorrect timezone data
      // (it added an extra 10 hours)
      seconds: WeatherToday.timezone - 36000,
    });
    dateDisplay.textContent = format(dateInLocal, "PPPP");
    timeDisplay.textContent = format(dateInLocal, "p");

    humidityDisplay.textContent = `${WeatherToday.humidity} %`;
    pressureDisplay.textContent = `${WeatherToday.pressure} hPa`;
  };

  return { displayAllData };
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
      DisplayController.displayAllData();
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

setFavicons(Favicon);
getTodaysWeatherData(defaultCity);
console.log(WeatherToday);
