const dayEl = document.querySelector(".default-day");
const dateEl = document.querySelector(".default-date");
const btnEl = document.querySelector(".btn-search");
const inputEl = document.querySelector("input[type='text']");
const suggestionsContainer = document.createElement('div');
suggestionsContainer.classList.add('suggestions');
inputEl.parentNode.appendChild(suggestionsContainer);

// تعيين اللغة الافتراضية بناءً على لغة المتصفح أو لغة المستخدم
const userLang = navigator.language || 'en';  // يمكنك تحديد اللغة هنا مثل 'en' أو 'ar'

// API Key for OpenWeatherMap
const apiKey = 'c5b271b835c8ae9a951c06ddeafdb83e'; // قم بتغيير هذا إلى مفتاحك الخاص من OpenWeatherMap

// Function to fetch weather data
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=${userLang}`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        updateWeather(data);
    } catch (error) {
        alert(error.message);
    }
}

// Function to update the weather information and add the flag
function updateWeather(data) {
    const { name, sys, main, wind, weather } = data;
    const temp = main.temp;
    const humidity = main.humidity;
    const windSpeed = wind.speed;
    const description = weather[0].description;
    const countryCode = sys.country; // رمز الدولة

    // جلب علم الدولة باستخدام رمز الدولة
    const flagUrl = `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;

    // تحديث المعلومات في الصفحة
    document.querySelector(".day-info .content:nth-child(1) .value").textContent = name;
    document.querySelector(".day-info .content:nth-child(2) .value").textContent = `${temp}°C`;
    document.querySelector(".day-info .content:nth-child(3) .value").textContent = `${humidity}%`;
    document.querySelector(".day-info .content:nth-child(4) .value").textContent = `${windSpeed} km/h`;
    document.querySelector(".icons .weather-temp").textContent = `${temp}°C`;
    document.querySelector(".icons .cloudtxt").textContent = description;

    // إضافة العلم بجانب اسم المدينة
    const cityElement = document.querySelector(".day-info .content:nth-child(1) .value");
    const flagElement = document.createElement('img');
    flagElement.src = flagUrl;
    flagElement.alt = countryCode;
    flagElement.classList.add('flag'); // إضافة كلاس لتحديد الحجم
    cityElement.appendChild(flagElement);
}

// Event listener for the search button
btnEl.addEventListener("click", (e) => {
    e.preventDefault();
    const city = inputEl.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        alert("Please enter a city name");
    }
});

// Function to fetch city suggestions
async function fetchCitySuggestions(query) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&appid=${apiKey}&lang=${userLang}`);
        if (!response.ok) {
            throw new Error('No suggestions found');
        }
        const data = await response.json();
        return data.list.map(city => city.name);
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Function to display city suggestions
function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    if (suggestions.length === 0) {
        return;
    }
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = suggestion;
        suggestionItem.addEventListener('click', () => {
            inputEl.value = suggestion;
            suggestionsContainer.innerHTML = '';
            fetchWeather(suggestion);
        });
        suggestionsContainer.appendChild(suggestionItem);
    });
}

// Event listener for input to fetch city suggestions
inputEl.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
        const suggestions = await fetchCitySuggestions(query);
        displaySuggestions(suggestions);
    } else {
        suggestionsContainer.innerHTML = '';
    }
});

// تحديث التاريخ اليومي
function updateDate() {
    const days = [
        "Sunday", 
        "Monday", 
        "Tuesday", 
        "Wednesday", 
        "Thursday", 
        "Friday", 
        "Saturday"
    ];

    const months = [
        "January", 
        "February", 
        "March", 
        "April", 
        "May", 
        "June", 
        "July", 
        "August", 
        "September", 
        "October", 
        "November", 
        "December"
    ];

    const today = new Date();
    const dayName = days[today.getDay()];
    const monthName = months[today.getMonth()];
    const date = today.getDate();
    const year = today.getFullYear();

    dayEl.textContent = dayName;
    dateEl.textContent = `${date} ${monthName} ${year}`;
}

// استدعاء الدالة لتحديث التاريخ عند تحميل الصفحة
updateDate();

// Fetch weather data for the default city (e.g., London)
fetchWeather('London');

async function fetchWeatherForecast(city) {
    try {
        const coords = await getCoordinates(city); // احصل على إحداثيات المدينة
        console.log(coords);  // تأكد من الإحداثيات
        const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&lang=${userLang}`);
        
        if (!response.ok) {
            throw new Error('Weather forecast not found');
        }
        
        const data = await response.json();
        console.log(data); // طباعة البيانات
        updateWeatherForecast(data.daily);  // تمرير البيانات إلى الدالة
    } catch (error) {
        console.error(error);
    }
}


// دالة تحديث التوقعات في HTML
function updateWeatherForecast(forecastData) {
    const forecastList = document.getElementById("weather-forecast");
    forecastList.innerHTML = ''; // مسح البيانات القديمة

    // تحديث 4 أيام قادمة
    forecastData.slice(0, 4).forEach(day => {
        const dayElement = document.createElement('li');
        
        // بيانات اليوم
        const dayName = new Date(day.dt * 1000).toLocaleDateString(userLang, { weekday: 'short' });
        const temp = Math.round(day.temp.day); // درجة الحرارة
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`; // أيقونة الطقس
        
        // إضافة العناصر إلى الـ li
        dayElement.innerHTML = `
            <img src="${iconUrl}" alt="Weather Icon">
            <span>${dayName}</span>
            <span class="day-temp">${temp}°C</span>
        `;
        
        forecastList.appendChild(dayElement); // إضافة الـ li إلى الـ ul
    });
}

// استدعاء دالة جلب التوقعات
fetchWeatherForecast('London'); // أو استبدال "London" بالمدينة المطلوبة


// هذه الدالة تستخدم لجلب بيانات الطقس من OpenWeatherMap API
async function getWeatherData(city) {
    const apiKey = 'YOUR_API_KEY'; // ضع مفتاح API الخاص بك هنا
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    return data;
}

// هذه الدالة تستخدم لتحديث صورة الأيقونة وبيانات الطقس
function updateWeatherIcon(data) {
    const iconCode = data.weather[0].icon; // جلب رمز الأيقونة من بيانات الطقس
    const temperature = data.main.temp; // جلب درجة الحرارة من بيانات الطقس
    const description = data.weather[0].description; // جلب وصف حالة الطقس من بيانات الطقس

    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    document.querySelector('.weather-temp').textContent = `${temperature}°C`;
    document.querySelector('.cloudtxt').textContent = description;
}

// استخدام الدالتين لجلب البيانات وتحديث الواجهة
getWeatherData('Cairo') // ضع اسم المدينة هنا
    .then(data => updateWeatherIcon(data))
    .catch(error => console.error('Error fetching weather data:', error));


    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    document.querySelector(".day-info .content:nth-child(1) .value").textContent = name;
    document.querySelector(".day-info .content:nth-child(2) .value").textContent = `${temp}°C`;
    document.querySelector(".day-info .content:nth-child(3) .value").textContent = `${humidity}%`;
    document.querySelector(".day-info .content:nth-child(4) .value").textContent = `${windSpeed} km/h`;
    document.querySelector(".icons .weather-temp").textContent = `${temp}°C`;
    document.querySelector(".icons .cloudtxt").textContent = description;


    /* التوقييييييييييييييييييييييييييت 

    
    function updateCountdown(targetHour, targetMinute, targetSecond) {
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, targetSecond, 0);
        
        let diff = target - now;
    
        if (diff < 0) {
            target.setDate(target.getDate() + 1); // الانتقال إلى اليوم التالي إذا تجاوز الوقت الهدف
            diff = target - now;
        }
    
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
        document.getElementById("hours").textContent = hours % 12 || 12;
        document.getElementById("minutes").textContent = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById("seconds").textContent = seconds < 10 ? '0' + seconds : seconds;
    }
    
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
                const localTime = new Date(new Date().getTime() - timezoneOffset);
                const targetHour = 19;
                const targetMinute = 29;
                const targetSecond = 57;
                updateCountdown(targetHour, targetMinute, targetSecond);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }
    
    getUserLocation();
    setInterval(getUserLocation, 1000);
    
 */

// Initialize Google Translate
function initializeTranslate() {
  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.body.appendChild(script);
  
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'ar,fr,de,es,it,ja,ko,pt',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
  };
}
// Create translate element
const translateDiv = document.createElement('div');
translateDiv.id = 'google_translate_element';
document.body.appendChild(translateDiv);

// Initialize translation
initializeTranslate();


/*                            المدن */



document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault(); // منع النموذج من الإرسال الافتراضي
    getWeatherForecast();
});

async function getWeatherForecast() {
    const city = document.getElementById('city-input').value; // احصل على اسم المدينة من المستخدم
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&cnt=4`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.cod === '200') {
            updateForecast(data);
        } else {
            alert('City not found. Please enter a valid city name.');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('An error occurred while fetching weather data. Please try again later.');
    }
}

function updateForecast(data) {
    const forecastList = document.getElementById('forecast-list');
    forecastList.innerHTML = ''; // إفراغ القائمة الحالية

    data.list.forEach((forecast, index) => {
        const day = new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'short' });
        const temp = `${Math.round(forecast.main.temp)}°C`;
        const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;

        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <img src="${iconUrl}" alt="Weather icon">
            <span>${day}</span>
            <span class="day-temp">${temp}</span>
        `;
        forecastList.appendChild(listItem);
    });
}
/*                انتهت المدن */


