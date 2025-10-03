// netlify/functions/forecast.js
import fetch from 'node-fetch'; // CRITICAL: Required for Netlify to use fetch

export async function handler(event, context) {
  // Read parameters for endpoint, city (q), lat, lon, and units
  const { endpoint, q, lat, lon, units } = event.queryStringParameters;
  const apiKey = process.env.OPENWEATHER_KEY; 

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not defined!" }) };
  }

  // Construct the base URL for OpenWeatherMap
  let url = `https://api.openweathermap.org/data/2.5/${endpoint}?appid=${apiKey}&units=${units}`;

  // Add the appropriate query parameter (q for city, lat/lon for coordinates)
  if (q) {
    url += `&q=${encodeURIComponent(q)}`;
  } else if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  }

  try {
    const res = await fetch(url);

    if (!res.ok) {
        // Pass the error status from OpenWeatherMap back to the client
        const text = await res.text();
        return { 
            statusCode: res.status, 
            body: JSON.stringify({ error: `OpenWeatherMap API Error: ${res.statusText || text}` }) 
        };
    }
    
    // Success
    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
    
  } catch (err) {
    // Catches network errors, DNS failures, or code execution errors
    console.error("Function execution error:", err);
    return { statusCode: 502, body: JSON.stringify({ error: "Failed to fetch data due to internal server or network error." }) };
  }
}