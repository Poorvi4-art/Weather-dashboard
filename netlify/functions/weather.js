export async function handler(event, context) {
  const city = event.queryStringParameters.q || "London";
  const apiKey = process.env.OPENWEATHER_KEY; // <--- must match exactly

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
}

