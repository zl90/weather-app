/* eslint-disable no-use-before-define */
/* eslint-disable no-useless-escape */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import "./style.css";
import { format, add } from "date-fns";
import BackgroundImage from "./background.jpg";
import Favicon from "./favicon-32x32.png";
import Icons from "./icons";

// DOM nodes
const body = document.querySelector("body");
const underlay = document.querySelector(".underlay");
const form1 = document.querySelector(".form-1");
const searchbar = document.querySelector(".searchbar");
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
const weatherIcon = document.querySelector(".weather-info-icon");
const loadingText = document.querySelector(".weather-info-loading");

// State
let units = "metric";
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
  timezone = 0,
  icon = ""
) => {
  const setProperties = (data) => {
    WeatherToday.city = data.name;
    WeatherToday.country = data.sys.country;
    WeatherToday.temperature = data.main.temp.toFixed(0);
    WeatherToday.feelslike = data.main.feels_like.toFixed(0);
    WeatherToday.description = data.weather[0].description;
    WeatherToday.main = data.weather[0].main;
    WeatherToday.humidity = data.main.humidity;
    WeatherToday.pressure = data.main.pressure; // note: pressure is in hPa

    // The local time is returned as an integer representing the shift
    // in seconds from UTC time. So I'll need to get the current time
    // in UTC, then add the amount of seconds to it.
    const dateInUTC = new Date().toUTCString();
    const dateInLocal = add(Date.parse(dateInUTC), {
      // API seems to be returning incorrect timezone data
      // (it added an extra 10 hours)
      seconds: data.timezone - 36000,
    });
    WeatherToday.timezone = dateInLocal;
    console.log(dateInLocal);

    if (units === "metric") {
      // Convert Meters/second to Kilometers/hour
      WeatherToday.windSpeed = (data.wind.speed * 3.6).toFixed(1);
    } else if (units === "imperial") {
      // Imperial units already show Miles/hour
      WeatherToday.windSpeed = data.wind.speed.toFixed(1);
    }

    WeatherToday.selectIcon(data);
  };

  const selectIcon = (data) => {
    const weatherID = data.weather[0].id;
    if (weatherID >= 802) {
      // cloudy
      WeatherToday.icon = Icons.cloud;
    } else if (weatherID === 801) {
      // partially cloudy
      if (
        new Date(Date.parse(WeatherToday.timezone)).getHours() >= 18 ||
        new Date(Date.parse(WeatherToday.timezone)).getHours() < 6
      ) {
        // Night time, set the icon to a moon
        WeatherToday.icon = Icons.cloudyNight;
      } else {
        // Day time, set the icon to a sun
        WeatherToday.icon = Icons.cloudyDay;
      }
    } else if (weatherID === 800) {
      // clear weather
      if (
        new Date(Date.parse(WeatherToday.timezone)).getHours() >= 18 ||
        new Date(Date.parse(WeatherToday.timezone)).getHours() < 6
      ) {
        // Night time, set the icon to a moon
        WeatherToday.icon = Icons.moon;
        console.log(new Date(Date.parse(WeatherToday.timezone)).getHours());
      } else {
        // Day time, set the icon to a sun
        WeatherToday.icon = Icons.sun;
        console.log(new Date(Date.parse(WeatherToday.timezone)).getHours());
      }
    } else if (weatherID >= 701 && weatherID <= 781) {
      // Atmospheric effects
      WeatherToday.icon = Icons.haze;
    } else if (weatherID >= 600 && weatherID <= 622) {
      // Snow
      WeatherToday.icon = Icons.snow;
    } else if (weatherID >= 300 && weatherID <= 531) {
      // Rain
      WeatherToday.icon = Icons.raincloud;
    } else if (weatherID >= 200 && weatherID <= 232) {
      // Storm
      WeatherToday.icon = Icons.storm;
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
    icon,
    setProperties,
    selectIcon,
  };
})();

// Displaying information on the DOM
const DisplayController = (() => {
  const showLoadingText = () => {
    if (underlay.style.visibility !== "hidden") {
      loadingText.style.visibility = "visible";
    }
  };

  const hideLoadingText = () => {
    loadingText.style.visibility = "hidden";
  };

  const loadBackgroundImage = () => {
    // Load background image asynchronously and only show a loading
    // GIF while the background image is downloading.
    const downloadingImage = new Image();
    downloadingImage.onload = function () {
      body.style.backgroundImage = `url(${this.src})`;
      body.style.backgroundSize = "cover";
      underlay.style.visibility = "visible";
    };
    downloadingImage.src = BackgroundImage;
    underlay.style.visibility = "hidden";
  };

  const displayAllData = () => {
    descriptionDisplay.textContent = capitalize(WeatherToday.description);
    cityDisplay.textContent = `${WeatherToday.city} ${WeatherToday.country}`;

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

    dateDisplay.textContent = format(WeatherToday.timezone, "PPPP");
    timeDisplay.textContent = format(WeatherToday.timezone, "p").toLowerCase();

    humidityDisplay.textContent = `${WeatherToday.humidity} %`;
    pressureDisplay.textContent = `${WeatherToday.pressure} hPa`;

    weatherIcon.innerHTML = WeatherToday.icon;

    hideLoadingText();
  };

  const toggleUnits = () => {
    if (units === "metric") {
      units = "imperial";
      unitsButton.textContent = "Display °C";
    } else {
      units = "metric";
      unitsButton.textContent = "Display °F";
    }
    // if (searchbar.value) {
    //   getTodaysWeatherData(searchbar.value);
    // } else {
    //   getTodaysWeatherData(defaultCity);
    // }

    getTodaysWeatherData(WeatherToday.city);
  };

  return {
    displayAllData,
    hideLoadingText,
    showLoadingText,
    loadBackgroundImage,
    toggleUnits,
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
  `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${units}&APPID=94bcd9b6ca50aef9b00d3ba7c664ea47`;

// Replaces whitespace with "+" to conform to the API standard.
const formatCityName = (cityName) => cityName.replaceAll(" ", "+");

// Makes a request to the Open Weather API for today's weather info.
const getTodaysWeatherData = async (cityName) => {
  try {
    DisplayController.showLoadingText();
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
    DisplayController.hideLoadingText();
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

const submitForm = async (event) => {
  event.preventDefault();
  getTodaysWeatherData(searchbar.value);
  searchbar.value = "";
  console.log(WeatherToday);
};

const clearSearchbarValidity = () => {
  searchbar.setCustomValidity("");
};

// Events
form1.addEventListener("submit", submitForm);
searchbar.addEventListener("input", clearSearchbarValidity);
unitsButton.addEventListener("click", DisplayController.toggleUnits);

DisplayController.loadBackgroundImage();
setFavicons(Favicon);
getTodaysWeatherData(defaultCity);
console.log(WeatherToday);
