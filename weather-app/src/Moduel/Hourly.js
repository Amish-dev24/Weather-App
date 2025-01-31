import React, { useEffect, useState } from "react";
//import "./Hourly.scss";
import "./Hourly.css";
const Hourly = ({ city, apiKey }) => {
  const [hourlyData, setHourlyData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHourlyWeather = async () => {
      try {
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
        );
        const geoData = await geoResponse.json();
        if (geoData.length === 0) {
          setError("City Not Found For Hourly Forecast.");
          return;
        }
        const { lat, lon } = geoData[0];
        const hourlyResponse = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&units=metric&appid=${apiKey}`
        );
        const hourly = await hourlyResponse.json();
        setHourlyData(hourly.hourly);
        setError(null);
      } catch (err) {
        setError("Error fetching hourly weather data.");
      }
    };

    fetchHourlyWeather();
  }, [city, apiKey]);

  return (
    <div className="hourly-container">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
        Hourly Weather
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      {hourlyData ? (
        <div className="hourly-cards">
          {hourlyData
            .filter((_, index) => index % 2 === 0) // Filter to show every 2 hours
            .slice(0, 6) // Limit to 12 entries
            .map((hour, index) => (
              <div key={index} className="hourly-card">
                <p className="hour">
                  {new Date(hour.dt * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                  alt={hour.weather[0].description}
                />
                <p className="temp">{hour.temp}°C</p>
                <p className="description">{hour.weather[0].description}</p>
              </div>
            ))}
        </div>
      ) : (
        <p>Loading hourly data...</p>
      )}
    </div>
  );
};

export default Hourly;
