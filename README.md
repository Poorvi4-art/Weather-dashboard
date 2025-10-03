# Dynamic Weather-dashboard

A responsive, single-page weather application that provides a unified, customizable view of current conditions, hourly forecasts, and a 5-day outlook for any global city. The design emphasizes clarity, accessibility, and a dynamic user experience with custom weather-based themes and animations.

✨ Features
Global Search: Easily find weather conditions by searching for a city name.
Geolocation: Use your browser's location to automatically find the weather for your current area.
Unit Toggle: Switch temperature and wind speed units between Celsius (°C) and Fahrenheit (°F) (Metric/Imperial).
Dynamic Theming: The dashboard background and effects (rain, snow, sun glow) change automatically to reflect the current weather condition (e.g., a cloudy theme for overcast skies).
Recent History: Saves your last 5 successful searches for quick, one-click access.
Comprehensive Data: Displays current temperature, 'feels like,' humidity, wind speed, pressure, a 5-day forecast, and an hourly timeline for the next 24 hours.

🛠️ Technology Stack
This project is built using a modern, lightweight, client-side approach:
HTML5: Semantic structure for the application layout.
CSS3 (Vanilla): Custom, mobile-responsive styling using CSS Grid and CSS Variables for clean theme management.
JavaScript (Vanilla ES6+): Handles all dynamic logic, API fetching, DOM manipulation, and state management (units, history).
OpenWeatherMap API: Used for fetching all current and forecast weather data.
Lucide Icons: A lightweight library for dynamic, visually clean weather icons.

🚀 Getting Started
Follow these instructions to set up and run the project locally.

Prerequisites
A modern web browser (Chrome, Firefox, Edge, Safari).
An API Key from OpenWeatherMap.

Installation
Clone the Repository:

git clone [YOUR_REPOSITORY_URL]
cd comfort-weather-dashboard

Insert API Key:
Open the script.js file and replace the placeholder with your actual OpenWeatherMap API key:

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY_HERE'; 

Run the Application:
Simply open the index.html file in your web browser.

📂 Project Structure
.
weather-app/
│
├─ index.html        # frontend
├─ script.js         # frontend JS
├─ style.css         # styling
└─ netlify/
   └─ functions/
      └─ weather.js  # serverless function
