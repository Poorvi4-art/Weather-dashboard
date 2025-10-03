// netlify/functions/weather.js
import fetch from 'node-fetch'; // CRITICAL: Required for Netlify to use fetch

export async function handler(event, context) {
  // Extract city and units from the client request
  const city = event.queryStringParameters.q || "London";
  const units = event.queryStringParameters.units || "metric"; // Use units from client

  const apiKey = process.env.OPENWEATHER_KEY; 

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not defined!" })
    };
  }

  // Construct URL with city, API key, and units
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`;
  
  try {
    const res = await fetch(url);

    if (!res.ok) {
        // Pass the error status from OpenWeatherMap back to the client
        const text = await res.text();
        return { 
            statusCode: res.status, 
            body: JSON.stringify({ error: `City not found or API error: ${res.statusText || text}` }) 
        };
    }
    
    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (err) {
    return { 
        statusCode: 502, 
        body: JSON.stringify({ error: "Failed to fetch current weather due to internal server or network error." }) 
    };
  }
}