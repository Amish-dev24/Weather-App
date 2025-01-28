import React, { useState, useEffect, useCallback } from "react";
import Historical from "./Moduel/Historical"; // Importing Historical component
import Daily from "./Moduel/Daily";
import Hourly from "./Moduel/Hourly";
import WeatherAlert from "./Moduel/WatherAlert"; // Fix typo in import if needed
import ActivityRecommendation from "./Moduel/ActivityRecommendation"; // Import the new component
import "./App.css"; // Custom CSS file

function App() {
  const [city, setCity] = useState("Lahore");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interests, setInterests] = useState([]); // State for user interests

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const fetchWeather = useCallback(async () => {
    if (!API_KEY) {
      setError('Weather API key is missing');
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

  const handleInterestChange = (e) => {
    const value = e.target.value;
    setInterests(prevInterests => 
        prevInterests.includes(value) 
            ? prevInterests.filter(interest => interest !== value) 
            : [...prevInterests, value]
    );
  };

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
        <div className="interests">
          <h3>Select Your Interests:</h3>
          <label>
            <input type="checkbox" value="outdoor" onChange={handleInterestChange} />
            Outdoor
          </label>
          <label>
            <input type="checkbox" value="indoor" onChange={handleInterestChange} />
            Indoor
          </label>
          <label>
            <input type="checkbox" value="sports" onChange={handleInterestChange} />
            Sports
          </label>
        </div>
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
          <WeatherAlert apiKey={API_KEY} city={city} />
          <ActivityRecommendation weather={weather} interests={interests} />
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
