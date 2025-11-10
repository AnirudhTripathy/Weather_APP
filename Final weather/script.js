// Advanced Weather App with Enhanced Features
// ⚠️ REPLACE 'YOUR_API_KEY' WITH YOUR ACTUAL OPENWEATHERMAP API KEY
const API_KEY = '8e2630ef88c23d4261fb8b1f0d3d8ab9';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// State Management
let currentUnit = 'metric';
const unitData = {
    metric: { temp: '°C', speed: 'm/s', distance: 'km' },
    imperial: { temp: '°F', speed: 'mph', distance: 'mi' }
};

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const weatherContainer = document.getElementById('weatherContainer');
const forecastContainer = document.getElementById('forecastContainer');

const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const clouds = document.getElementById('clouds');
const uvIndex = document.getElementById('uvIndex');
const maxTemp = document.getElementById('maxTemp');
const minTemp = document.getElementById('minTemp');
const tempUnit = document.getElementById('tempUnit');
const forecastGrid = document.getElementById('forecastGrid');

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
    else showError('Please enter a city name');
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
        else showError('Please enter a city name');
    }
});

document.getElementById('tempToggle').addEventListener('click', () => {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    tempUnit.textContent = unitData[currentUnit].temp;
});

// Load default weather on page load
window.addEventListener('load', () => {
    if (API_KEY === 'YOUR_API_KEY') {
        showError('⚠️ IMPORTANT: Replace "YOUR_API_KEY" with your actual OpenWeatherMap API key in the JavaScript code!');
        return;
    }
    fetchWeather('London');
});

/**
 * Fetch weather data
 */
async function fetchWeather(city) {
    try {
        showLoading(true);
        clearError();

        if (API_KEY === 'YOUR_API_KEY') {
            throw new Error('API key not configured. Please add your OpenWeatherMap API key.');
        }

        const weatherResponse = await fetch(
            `${API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`
        );

        if (!weatherResponse.ok) {
            if (weatherResponse.status === 401) {
                throw new Error('Invalid API key. Check your OpenWeatherMap credentials.');
            } else if (weatherResponse.status === 404) {
                throw new Error('City not found. Please try another city.');
            }
            throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherResponse.json();

        const forecastResponse = await fetch(
            `${API_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`
        );

        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }

        const forecastData = await forecastResponse.json();

        displayCurrentWeather(weatherData);
        displayForecast(forecastData);

        showLoading(false);
        weatherContainer.classList.remove('hidden');
        forecastContainer.classList.remove('hidden');

    } catch (error) {
        showLoading(false);
        showError(error.message || 'Failed to fetch weather');
        weatherContainer.classList.add('hidden');
        forecastContainer.classList.add('hidden');
    }
}

/**
 * Display current weather
 */
function displayCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    temperature.textContent = Math.round(data.main.temp);
    maxTemp.textContent = Math.round(data.main.temp_max) + unitData[currentUnit].temp;
    minTemp.textContent = Math.round(data.main.temp_min) + unitData[currentUnit].temp;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    weatherDescription.textContent = data.weather[0].description;

    feelsLike.textContent = Math.round(data.main.feels_like) + unitData[currentUnit].temp;
    humidity.textContent = data.main.humidity + '%';
    windSpeed.textContent = data.wind.speed + ' ' + unitData[currentUnit].speed;
    pressure.textContent = data.main.pressure + ' hPa';
    visibility.textContent = (data.visibility / 1000).toFixed(1) + ' ' + unitData[currentUnit].distance;
    clouds.textContent = data.clouds.all + '%';
    uvIndex.textContent = (data.clouds.all / 10).toFixed(1);
}

/**
 * Display 5-day forecast
 */
function displayForecast(data) {
    forecastGrid.innerHTML = '';
    const forecasts = [];
    const seenDates = new Set();

    for (let i = 0; i < data.list.length; i++) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (!seenDates.has(dateString)) {
            seenDates.add(dateString);
            forecasts.push(forecast);
            if (forecasts.length === 5) break;
        }
    }

    forecasts.forEach((forecast) => {
        const card = document.createElement('div');
        card.className = 'forecast-card';

        const date = new Date(forecast.dt * 1000);
        const dateText = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
        const tempHigh = Math.round(forecast.main.temp_max);
        const tempLow = Math.round(forecast.main.temp_min);

        card.innerHTML = `
            <div class="forecast-date">${dateText}</div>
            <img src="${iconUrl}" alt="forecast" class="forecast-icon">
            <div class="forecast-temps">
                <span class="forecast-temp-high">${tempHigh}°</span>
                <span class="forecast-temp-low">${tempLow}°</span>
            </div>
            <div class="forecast-desc">${forecast.weather[0].description}</div>
        `;

        forecastGrid.appendChild(card);
    });
}

/**
 * Show loading
 */
function showLoading(show) {
    loadingSpinner.classList.toggle('hidden', !show);
}

/**
 * Show error
 */
function showError(message) {
    errorMessage.textContent = `⚠️ ${message}`;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 8000);
}

/**
 * Clear error
 */
function clearError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
}