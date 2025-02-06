import React, { useState, useEffect, useCallback } from "react";
import "./WeatherAlert.scss";

const WeatherAlert = ({ apiKey, city }) => {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState(null);
  const [locationName, setLocationName] = useState("");

  // Wrap showNotification in useCallback to prevent unnecessary re-renders
  const showNotification = useCallback(
    (alert) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Weather Alert!", {
          body: `Weather alert for ${locationName}: ${alert.event}`,
          icon: "/weather-icon.png",
        });
      }
    },
    [locationName]
  ); // Dependency on locationName to keep it updated

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!city || !apiKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, get coordinates for the city
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
        );

        if (!geoResponse.ok) {
          throw new Error("Failed to get city coordinates");
        }

        const geoData = await geoResponse.json();

        if (!geoData.length) {
          throw new Error("City not found");
        }

        const { lat, lon, name, country, state } = geoData[0];
        setCoordinates({ lat, lon });
        setLocationName(`${name}${state ? `, ${state}` : ""}, ${country}`);

        // Then fetch weather alerts using coordinates
        const alertResponse = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&exclude=minutely,hourly,daily`
        );

        if (!alertResponse.ok) {
          throw new Error(`Weather API error: ${alertResponse.statusText}`);
        }

        const data = await alertResponse.json();
        console.log("Weather data:", data); // Debug log

        if (data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts);
          // Show notification for new alerts
          data.alerts.forEach((alert) => showNotification(alert));
        } else {
          setAlerts([]);
        }
      } catch (err) {
        setError(err.message || "Error fetching weather alerts");
        console.error("Weather Alert Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [city, apiKey, showNotification]); // Added showNotification as a dependency

  if (loading) {
    return (
      <div className="weather-alert loading">
        <div className="loading-spinner"></div>
        <p>Loading weather alerts for {city}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-alert error">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="weather-alerts-container">
      <h2>Weather Alerts for {locationName || city}</h2>
      {coordinates && (
        <p className="location-info">
          Location: {coordinates.lat.toFixed(4)}°N, {coordinates.lon.toFixed(4)}
          °E
        </p>
      )}
      {alerts.length > 0 ? (
        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <div key={index} className="weather-alert">
              <h3>{alert.event}</h3>
              <p className="alert-source">Source: {alert.sender_name}</p>
              <p className="alert-description">{alert.description}</p>
              <p className="alert-time">
                Start: {new Date(alert.start * 1000).toLocaleString()}
                <br />
                End: {new Date(alert.end * 1000).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-alerts">
          No weather alerts at this time for {locationName || city}.
        </p>
      )}
    </div>
  );
};

export default WeatherAlert;
