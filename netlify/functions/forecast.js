// netlify/functions/forecast.js
import fetch from 'node-fetch';

export async function handler(event, context) {
  // Read parameters for endpoint, city (q), lat, lon, and units
  const { endpoint, q, lat, lon, units } = event.queryStringParameters;
  const apiKey = process.env.OPENWEATHER_KEY; // Securely access the key

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not defined!" }) };
  }

  // Construct the URL based on the 'endpoint' requested from the client
  let url = `https://api.openweathermap.org/data/2.5/${endpoint}?appid=${apiKey}&units=${units}`;

  if (q) {
    url += `&q=${encodeURIComponent(q)}`;
  } else if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
        // Pass the error status from OpenWeatherMap back to the client
        return { statusCode: res.status, body: JSON.stringify({ error: `OpenWeatherMap API Error: ${res.statusText}` }) };
    }
    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch data from OpenWeatherMap." }) };
  }
}