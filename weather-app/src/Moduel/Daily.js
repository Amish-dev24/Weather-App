import React, { useState, useEffect } from "react";

const Daily = ({ city, apiKey }) => {
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDailyWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch latitude and longitude for the city
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
        );
        if (!geoResponse.ok)
          throw new Error("Failed to fetch geolocation data");

        const geoData = await geoResponse.json();
        if (!geoData.length) throw new Error("City not found.");

        const { lat, lon } = geoData[0];

        // Fetch daily forecast data
        const dailyResponse = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`
        );
        if (!dailyResponse.ok)
          throw new Error("Failed to fetch daily forecast data");

        const daily = await dailyResponse.json();
        setDailyData(daily.daily.slice(0, 4)); // Limit to the next 4 days
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyWeather();
  }, [city, apiKey]);

  return (
    <div className="container p-6 mx-auto bg-gray-100 rounded-lg shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
        4-Day Weather Forecast
      </h2>
      {loading && (
        <p className="text-center text-gray-600">Loading daily data...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
      {dailyData && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {dailyData.map((day, index) => (
            <div
              key={index}
              className="p-6 transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-xl"
            >
              <p className="text-xl font-semibold text-gray-800">
                {new Date(day.dt * 1000).toLocaleDateString()}
              </p>
              <div className="flex items-center justify-between mt-4">
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                  alt={day.weather[0].description}
                  className="w-16 h-16"
                />
                <p className="text-2xl font-semibold text-gray-700">
                  {day.temp.day}°C
                </p>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {day.weather[0].description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Daily;
