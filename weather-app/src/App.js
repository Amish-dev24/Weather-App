import React, { useState, useEffect, useCallback } from "react";
import Historical from "./Moduel/Historical";
import Daily from "./Moduel/Daily";
import Hourly from "./Moduel/Hourly";
import WeatherAlert from "./Moduel/WatherAlert";
import ActivitySuggestions from "./Moduel/ActivitySuggestions";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import search from "./Assets/search.png";
import humidity from "./Assets/humidity.png";
import wind from "./Assets/wind.png";
import temperature from "./Assets/temperature.png";

// Import background images
import clear from "./Assets/clear.png";
import rain from "./Assets/rain.png";
import cloud from "./Assets/cloud.png";
import snow from "./Assets/snow.png";
import thunderstorm from "./images/thunderstorm.jpg";
import defaulttt from "./images/defaulttt.jpg";

function App() {
  const [city, setCity] = useState("Lahore");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(defaulttt); // Default background

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const fetchWeather = useCallback(async () => {
    if (!API_KEY) {
      setError("Weather API key is missing");
      return;
    }

    setLoading(true);
    setError(null); // Reset error before fetching new data

    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        handleError(response);
        return;
      }
      const data = await response.json();
      setWeather(data);
      setError(null);

      // Set background image based on weather condition
      const weatherCondition = data.weather[0].main.toLowerCase();
      switch (weatherCondition) {
        case "clear":
          setBackgroundImage(clear);
          break;
        case "rain":
          setBackgroundImage(rain);
          break;
        case "clouds":
          setBackgroundImage(cloud);
          break;
        case "snow":
          setBackgroundImage(snow);
          break;
        case "thunderstorm":
          setBackgroundImage(thunderstorm);
          break;
        default:
          setBackgroundImage(defaulttt);
      }
    } catch (error) {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [city, API_KEY]);

  const handleError = (response) => {
    switch (response.status) {
      case 401:
        setError("Unauthorized: Please check your API key.");
        break;
      case 404:
        setError("City not found. Please enter a valid city name.");
        break;
      default:
        setError(`Error: ${response.status} - ${response.statusText}`);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const handleCityChange = (e) => {
    setCity(e.target.value);
    fetchWeather();
  };

  if (!API_KEY) {
    return (
      <div className="app-container">
        <div className="error">Please configure your API key</div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Loader Modal */}
      {loading && (
        <div className="loader-modal-overlay">
          <div className="loader-modal-content">
            <div className="container">
              <div className="cloud front">
                <span className="left-front"></span>
                <span className="right-front"></span>
              </div>
              <span className="sun sunshine"></span>
              <span className="sun"></span>
              <div className="cloud back">
                <span className="left-back"></span>
                <span className="right-back"></span>
              </div>
            </div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      <header className="app-header">
        <h1 className="dashboard-title">Weather Dashboard</h1>
      </header>

      <main className="app-main">
        <div className="input-container">
          <input
            type="text"
            value={city}
            onChange={handleCityChange}
            placeholder="Enter city"
            className="city-input"
          />
          <img src={search} alt="Search" className="search-icon" />
        </div>

        {error && <p className="error">{error}</p>}

        {/* Main Weather Card */}
        {weather && weather.main && (
          <div className="main-weather">
            <div className="weather-card">
              <h2>{weather.name}</h2>
              <div className="weather-icon-container">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="weather-icon"
                />
              </div>
              <div className="weather-details">
                <p>
                  <img
                    src={temperature}
                    alt="Temperature"
                    className="detail-icon"
                  />
                  <span>{weather.main.temp}°C</span>
                </p>
                <p>
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt="Weather"
                    className="weather-icon1"
                  />
                  <span>
                    {weather.weather[0].description.charAt(0).toUpperCase() +
                      weather.weather[0].description.slice(1)}
                  </span>
                </p>
                <p>
                  <img src={humidity} alt="Humidity" className="detail-icon" />
                  <span>{weather.main.humidity}%</span>
                </p>
                <p>
                  <img src={wind} alt="Wind Speed" className="detail-icon" />
                  <span>{weather.wind.speed} m/s</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Forecast Section */}
        <div className="forecast-container">
          <div className="hourly-section card">
            <Hourly city={city} apiKey={API_KEY} />
          </div>
          <div className="daily-section card">
            <Daily city={city} apiKey={API_KEY} />
          </div>
        </div>

        {/* Additional Components */}
        <div className="additional-components">
          <div className="card">
            <Historical />
          </div>

          <div className="container card">
            <div className="activity-suggestions-container">
              <ActivitySuggestions />
            </div>

            <div className="weather-alert-container">
              <WeatherAlert apiKey={API_KEY} city={city} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
