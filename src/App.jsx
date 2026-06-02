import { useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [locationName, setLocationName] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function getWeather() {
    setError("");      // reset error
    setWeather(null);   // reset weather (loading efekt)
    setLoading(true);

    // ❗ No input
    if (!city.trim()) {
      setError("Please enter a city name");
      setLoading(false);
      return;
    }

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );

      const geoData = await geoResponse.json();

      // ❗ Check if API found the city
      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found");
        setLoading(false);
        return;
      }

      const latitude = geoData.results[0].latitude;
      const longitude = geoData.results[0].longitude;
      setLocationName(geoData.results[0].name);

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
      );

      const weatherData = await weatherResponse.json();
      setWeather(weatherData);

      console.log(weatherData);
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  function getWeatherIcon(code) {
    if (code === 0) return "☀️"; // jasno
    if (code <= 3) return "⛅";   // polooblačno
    if (code <= 48) return "🌫️"; // hmla
    if (code <= 67) return "🌧️"; // dážď
    if (code <= 82) return "🌦️"; // prehánky
    if (code <= 86) return "🌨️"; // sneh
    return "❓";
  }

  return (
    <div style={{padding: 20, textAlignItems: "center",}}>
      <h1>Weather App</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              getWeather();
            }
          }}
          placeholder="Enter city"
        />

        <button onClick={getWeather}>
          Get Weather
        </button>
      </div>

      {weather && (
        <div 
          style={{ 
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 20
          }}
        >
          <h3 style={{marginBottom: 10 }}>5-Day Forecast</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 15
              }}
            >
              {weather.daily.time.slice(0, 5).map((day, index) => (
                <div
                  key={day}
                  style={{
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    textAlign: "center"
                  }}
                >
                  <p>
                    {new Date(day).toLocaleDateString("en-US", {
                      weekday: "short"
                    })}
                  </p>

                  <p>
                    {getWeatherIcon(weather.daily.weather_code[index])}
                  </p>

                  <p>
                    {weather.daily.temperature_2m_max[index]}°C
                  </p>

                  <p style={{ fontSize: 12 }}>
                    {weather.daily.temperature_2m_min[index]}°C
                  </p>
                </div>
              ))}
            </div>
        </div>
      )}

      {loading && (
        <p style={{ color: "blue" }}>
          🌦️ Fetching weather data...
        </p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default App;
