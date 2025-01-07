import React, { useState, useEffect, useCallback } from "react";
import Historical from "./Moduel/Historical"; // Importing Historical component
import Daily from "./Moduel/Daily";
import Hourly from "./Moduel/Hourly";
import "./App.css"; // Custom CSS file

function App() {
  const [city, setCity] = useState("Lahore");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const fetchWeather = useCallback(async () => {
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

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Weather App</h1>
      </header>
      <main className="app-main">
        <input
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Enter city"
          className="city-input"
        />
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}
        {weather && weather.main && (
          <div className="weather-card">
            <h2>{weather.name}</h2>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <p>Temperature: {weather.main.temp}°C</p>
            <p>Weather: {weather.weather[0].description}</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind Speed: {weather.wind.speed} m/s</p>
          </div>
        )}
        <section className="additional-info">
          <h2>Historical Weather Events</h2>
          <Historical />
          <Daily city={city} apiKey={API_KEY} />
          <Hourly city={city} apiKey={API_KEY} />
        </section>
      </main>
    </div>
  );
}

export default App;
