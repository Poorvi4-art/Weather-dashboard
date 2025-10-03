// --- CONFIGURATION AND DATA OBJECTS ---
const APP_CONFIG = {
    MAX_HISTORY: 5,
    // Consolidated data structure for conditions, icons, and advice
    WEATHER_MAP: [
        { main: "Clear", icon: "sun", advice: "☀ Stay hydrated or take a walk!" },
        { main: "Rain", icon: "cloud-rain", advice: "🌧 Don't forget your umbrella!" },
        { main: "Drizzle", icon: "cloud-drizzle", advice: "🌧 Light rain—an umbrella is handy." },
        { main: "Snow", icon: "cloud-snow", advice: "❄ Layer up and stay warm!" },
        { main: "Thunderstorm", icon: "zap", advice: "⛈ Best to stay inside and wait it out." },
        { main: "Clouds", icon: "cloud", advice: "☁ Enjoy the calm clouds." },
        { main: "Mist", icon: "cloud-fog", advice: "🌁 Drive carefully, visibility may be low." },
        { main: "Smoke", icon: "cloud-fog", advice: "⚠️ Air quality might be affected." },
        { main: "Haze", icon: "sun-dim", advice: "⚠️ Air quality might be affected." },
        { main: "Dust", icon: "cloud-fog", advice: "🌪 Close your windows!" },
        { main: "Fog", icon: "cloud-fog", advice: "🌁 Drive carefully, visibility may be low." },
        { main: "Sand", icon: "cloud-fog", advice: "🌪 Close your windows!" },
        { main: "Ash", icon: "cloud-fog", advice: "⚠️ Air quality alert." },
        { main: "Squall", icon: "wind", advice: "💨 High winds, secure loose items." },
        { main: "Tornado", icon: "tornado", advice: "🚨 Take shelter immediately!" },
    ],
    // Function to find the corresponding data object
    getWeatherData: (condition) => APP_CONFIG.WEATHER_MAP.find(w => condition.includes(w.main)) || { main: "Unknown", icon: "cloud", advice: "🌍 Have a great day!" },
};

// --- DOM ELEMENTS ---
const searchButton = document.getElementById("search-button");
const cityInput = document.getElementById("city-input");
const errorMessage = document.getElementById("error-message");
const unitToggle = document.getElementById("unit-toggle");
const themeToggle = document.getElementById("theme-toggle");
const currentLocationButton = document.getElementById("current-location-button");

const homePage = document.getElementById("location-home");
const resultsPage = document.getElementById("results-page");
const historyContainer = document.getElementById("history-container");
const weatherInfo = document.getElementById("weather-info");
const forecastInfo = document.getElementById("forecast-info");
const hourlyInfo = document.getElementById("hourly-info");

let currentUnit = "metric";
let lastCity = null;


// --- UTILITY FUNCTIONS ---
function showPage(pageId) {
    if (pageId === 'results') {
        homePage.classList.add('hidden');
        resultsPage.classList.remove('hidden');
    } else {
        resultsPage.classList.add('hidden');
        homePage.classList.remove('hidden');
        renderHistory();
    }
}

function getUnitSymbol() { return currentUnit === "metric" ? "°C" : "°F"; }
function getWindUnit() { return currentUnit === "metric" ? "m/s" : "mph"; }
function mapLucideIcon(condition) { return APP_CONFIG.getWeatherData(condition).icon; }
function getMoodMessage(condition) {
    const data = APP_CONFIG.getWeatherData(condition);
    if (data.main === "Rain") return "☔ Stay dry!";
    if (data.main === "Snow") return "❄ Enjoy the snow!";
    if (data.main === "Clear") return "☀ Bright and sunny!";
    if (data.main === "Clouds") return "☁ Cloudy skies ahead";
    if (data.main === "Thunderstorm") return "⛈ Stay safe indoors!";
    return "🌍 Have a pleasant hour!";
}


// --- HISTORY MANAGEMENT ---
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
    history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
    history.unshift(city);
    history = history.slice(0, APP_CONFIG.MAX_HISTORY);
    localStorage.setItem('weatherHistory', JSON.stringify(history));
}

function renderHistory() {
    let history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
    historyContainer.innerHTML = '';
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="placeholder-text">Search a city to start your history!</p>';
        return;
    }
    history.forEach(city => {
        const item = document.createElement('span');
        item.classList.add('history-item');
        item.textContent = city;
        item.addEventListener('click', () => {
            cityInput.value = city;
            getWeather(city);
        });
        historyContainer.appendChild(item);
    });
}


// --- GEOLOCATION ---
currentLocationButton.addEventListener('click', getCurrentLocationWeather);

function getCurrentLocationWeather() {
    errorMessage.textContent = "Locating you...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            err => {
                errorMessage.textContent = "⚠️ Geolocation failed. Please type a city name.";
                showPage('home');
            }
        );
    } else {
        errorMessage.textContent = "⚠️ Geolocation is not supported by your browser.";
        showPage('home');
    }
}

// **MODIFIED:** Routes through the secure Netlify 'forecast' function.
async function getWeatherByCoords(lat, lon) {
    weatherInfo.innerHTML = '<div class="loading-state">⏳ Loading weather data...</div>';
    showPage('results');
    try {
        // Call the secure 'forecast' function to get current data based on coords
        const res = await fetch(`/.netlify/functions/forecast?endpoint=weather&lat=${lat}&lon=${lon}&units=${currentUnit}`);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Could not fetch weather data for current location.");
        }
        
        const data = await res.json();
        
        // Use the city name from the successful response to call the full getWeather flow
        cityInput.value = data.name;
        getWeather(data.name);

    } catch (err) {
        errorMessage.textContent = err.message;
        showPage('home');
    }
}


// --- MAIN FETCH LOGIC ---
// **MODIFIED:** Calls two Netlify functions and includes robust error checking.
async function getWeather(city) {
    weatherInfo.innerHTML = '<div class="loading-state">⏳ Fetching weather details...</div>';
    forecastInfo.innerHTML = "";
    hourlyInfo.innerHTML = "";
    errorMessage.textContent = "";
    showPage('results');

    try {
        lastCity = city;

        // Fetch current weather and forecast concurrently using Promise.all
        const [currentRes, forecastRes] = await Promise.all([
            // 1. Current Weather (Calls the existing 'weather' function)
            fetch(`/.netlify/functions/weather?q=${encodeURIComponent(city)}&units=${currentUnit}`),
            
            // 2. Forecast (Calls the NEW 'forecast' function)
            fetch(`/.netlify/functions/forecast?endpoint=forecast&q=${encodeURIComponent(city)}&units=${currentUnit}`)
        ]);

        // CRITICAL CHECK 1: Check if current weather fetch failed
        if (!currentRes.ok) {
            const errorData = await currentRes.json();
            throw new Error(errorData.error || `City "${city}" not found (Error Code: ${currentRes.status})`);
        }
        
        // CRITICAL CHECK 2: Check if forecast fetch failed
        if (!forecastRes.ok) {
            const errorData = await forecastRes.json();
            throw new Error(errorData.error || `Forecast data unavailable for "${city}" (Error Code: ${forecastRes.status})`);
        }

        // Only proceed if BOTH responses are okay
        const data = await currentRes.json();
        const forecastData = await forecastRes.json();

        saveToHistory(data.name);
        displayWeather(data);
        displayForecast(forecastData.list);
        displayHourly(forecastData.list);

        // RENDER ICONS AFTER DOM UPDATE
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }

    } catch (err) {
        errorMessage.textContent = err.message;
        showPage('home');
    }
}


// --- DISPLAY FUNCTIONS ---

function displayWeather(data) {
    const unitSymbol = getUnitSymbol();
    const windUnit = getWindUnit();
    const condition = data.weather[0].main;
    const weatherDetails = APP_CONFIG.getWeatherData(condition);

    weatherInfo.innerHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <div class="temp-display">${Math.round(data.main.temp)}${unitSymbol}</div>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].description}" />
        <div class="weather-details">
            <p>Feels Like: ${Math.round(data.main.feels_like)}${unitSymbol}</p>
            <p>Condition: ${data.weather[0].description}</p>
            <p>💨 Wind: ${data.wind.speed} ${windUnit}</p>
            <p>💧 Humidity: ${data.main.humidity}%</p>
        </div>
        <div class="advice">${weatherDetails.advice}</div>
    `;
}

function displayForecast(list) {
    forecastInfo.innerHTML = "";
    const unitSymbol = getUnitSymbol();
    // Filter for 12:00:00 only to get daily forecast
    const dailyForecast = list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyForecast.forEach(day => {
        const date = new Date(day.dt_txt);
        const options = { weekday: "short", month: "short", day: "numeric" };
        const card = document.createElement("div");
        card.classList.add("card", "forecast-card");

        card.innerHTML = `
            <h4>${date.toLocaleDateString(undefined, options)}</h4>
            <p><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" /></p>
            <p><strong>${Math.round(day.main.temp)}${unitSymbol}</strong></p>
        `;
        forecastInfo.appendChild(card);
    });
}

function displayHourly(list) {
    hourlyInfo.innerHTML = "";
    const unitSymbol = getUnitSymbol();
    const today = new Date().toDateString();
    // Get up to 8 hours for today's timeline
    const todayHours = list.filter(item => new Date(item.dt_txt).toDateString() === today).slice(0, 8);

    todayHours.forEach(hour => {
        const dateObj = new Date(hour.dt_txt);
        const h = dateObj.getHours();
        const formattedTime = h % 12 === 0 ? '12' : h % 12;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const condition = hour.weather[0].main;
        const iconName = mapLucideIcon(condition);

        const card = document.createElement("div");
        card.className = "hour-card";
        card.innerHTML = `
            <div class="time">${formattedTime}${ampm}</div>
            <i data-lucide="${iconName}"></i>
            <div class="temp">${Math.round(hour.main.temp)}${unitSymbol}</div>
            <div class="mood">${getMoodMessage(condition)}</div>
        `;
        hourlyInfo.appendChild(card);
    });
}


// --- EVENT LISTENERS & INITIALIZATION ---
searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    city ? getWeather(city) : errorMessage.textContent = "⚠️ Please enter a city name!";
});
cityInput.addEventListener("keypress", e => {
    if (e.key === "Enter") searchButton.click();
});

unitToggle.addEventListener("click", () => {
    currentUnit = currentUnit === "metric" ? "imperial" : "metric";
    unitToggle.textContent = currentUnit === "metric" ? "Switch to °F" : "Switch to °C";
    if (lastCity) getWeather(lastCity);
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
});


document.addEventListener('DOMContentLoaded', () => {
    showPage('home');
    // Set initial state for Dark Mode toggle
    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️ Light Mode";
    }
});