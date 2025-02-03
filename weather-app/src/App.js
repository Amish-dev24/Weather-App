import React, { useState, useEffect, useCallback } from "react";
import Historical from "./Moduel/Historical"; // Importing Historical component
import Daily from "./Moduel/Daily";
import Hourly from "./Moduel/Hourly";
import WeatherAlert from "./Moduel/WatherAlert"; // Fix typo in import if needed
//import ActivityRecommendation from "./Moduel/ActivityRecommendation"; // Import the new component
import ActivitySuggestions from "./Moduel/ActivitySuggestions";
import "./App.css"; // Custom CSS file

function App() {
  const [city, setCity] = useState("Lahore");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //const [interests, setInterests] = useState([]); // State for user interests

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const fetchWeather = useCallback(async () => {
    if (!API_KEY) {
      setError("Weather API key is missing");
      return;
    }

    setLoading(true);
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

  // const handleInterestChange = (e) => {
  //   const value = e.target.value;
  //   setInterests((prevInterests) =>
  //     prevInterests.includes(value)
  //       ? prevInterests.filter((interest) => interest !== value)
  //       : [...prevInterests, value]
  //   );
  // };

  // Render error message if API key is missing
  if (!API_KEY) {
    return (
      <div className="app-container">
        <div className="error">Please configure your API key</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Weather Dashboard</h1>
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
        </div>

        {loading && <p className="loading">Loading weather data...</p>}
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
                <p>Temperature: {weather.main.temp}°C</p>
                <p>Weather: {weather.weather[0].description}</p>
                <p>Humidity: {weather.main.humidity}%</p>
                <p>Wind Speed: {weather.wind.speed} m/s</p>
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
          {/* Historical Data First */}
          <div className="card">
            <Historical />
          </div>

          {/* One div for Weather Alert and Activity Suggestions (stacked vertically) */}
          <div className="container card">
            <WeatherAlert apiKey={API_KEY} city={city} />
            <ActivitySuggestions />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
