const map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);


const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', searchLocation);

async function searchLocation() {
  const input = document.getElementById('searchInput').value;

  // API för OpenCage Geocoding för  latitud and longitud
  const apiKey = "57135f8a6e6f486aa5ca47d042d22a36";
  const geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(input)}&key=${apiKey}`;

  try {
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      var result = data.results[0];
      var lat = result.geometry.lat;
      var lon = result.geometry.lng;

      // Sätt zoom till kartan vid sökning
      map.setView([lat, lon], 10);

      // Tar bort befintliga markers
      /*map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });*/

       //Skapar en anpassad ikon med bakgrundsbild (din SVG-fil)
      const customIcon = L.divIcon({
        className: 'marker-bounce',
        iconSize: [30, 40],
      });
      
      document.getElementById("weatherContainer").style.display = 'block';
      document.getElementById("cityInfoContainer").style.display = 'block';

 // Lägg till en marker med den anpassade ikonen på kartan
const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);

// Göm markören
marker.setOpacity(0);

// Lägg till popup-fönster och öppna det
marker.bindPopup("<b>Du är här</b>", {
}).openPopup();

      // Anropa getWeatherInfo med koordinaterna från sökresultatet
      await getWeatherInfo({ lat, lon });

      // Hämta stadsinformation från Nominatim API
      const nominatimApiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const nominatimResponse = await fetch(nominatimApiUrl);
      const nominatimData = await nominatimResponse.json();

      // Anropar funktion
      displayCityInfo(nominatimData);
    } else {
      alert('Location not found');
    }
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    alert('Error fetching geocoding data');
  }
}

function displayCityInfo(nominatimData) {
  // Hämta stadsinformation från Nominatim API
  const cityInfoContainer = document.getElementById("cityInfoContainer");

  if (nominatimData.address) {
    const city = nominatimData.address.city || nominatimData.address.town || nominatimData.address.village || nominatimData.address.hamlet;
    const country = nominatimData.address.country;
    
    // Lagrar stadsinformation
    const cityInfo = `
      <b>Stad:</b> ${city || 'Ej tillgänglig'} <br>
      
      <b>Land:</b> ${country || 'Ej tillgänglig'}
    `;

    //Utskrift DOM
    cityInfoContainer.innerHTML = `<p style="font-weight: bold;"></p> ${cityInfo}`;
  } else {
    console.error("Stadsinformation ej tillgänglig.");
    cityInfoContainer.innerHTML = "";
  }
} 

/***************************************************************************************/

async function getWeatherInfo(firstResult) {
  const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather";
  const weatherApiKey = "f03b3083790c7bc4b85a5604394882ad";

  try {
    // Hämta väderinformation från OpenWeatherMap API
    const weatherResponse = await fetch(`${weatherApiUrl}?lat=${firstResult.lat}&lon=${firstResult.lon}&appid=${weatherApiKey}&lang="sv"`);
    const weatherData = await weatherResponse.json();

    // Hämtar ID "weatherContainer"
    const weatherContainer = document.getElementById("weatherContainer");

    if (weatherData.main) {
      const temperatureKelvin = weatherData.main.temp;
      const temperatureCelsius = (temperatureKelvin - 273.15).toFixed(2);
      const weatherDescription = weatherData.weather[0]?.description;
      const windSpeed = weatherData.wind?.speed; // Vindhastighet i meter per sekund
      const feelsLikeTemperatureKelvin = weatherData.main?.feels_like;
      const feelsLikeTemperatureCelsius = (feelsLikeTemperatureKelvin - 273.15).toFixed(2);
      const weatherIcon = weatherData.weather[0]?.icon;
      
      // Visa väderinformation
      const weatherInfo = `
        <b>Temperatur:</b> ${temperatureCelsius} °C <br> 
        <b>Upplevd temperatur:</b> ${feelsLikeTemperatureCelsius} °C <br> 
        <b>Vindhastighet:</b> ${windSpeed} m/s <br> 
        <b>Väderbeskrivning:</b> ${weatherDescription || 'Ej tillgänglig'}
        <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="Väderikon">
      `
      if (temperatureCelsius < 0) {
        weatherContainer.style.backgroundColor = 'blue';
      } else if (temperatureCelsius >= 0 && temperatureCelsius <= 10) {
        weatherContainer.style.backgroundColor = 'lightblue'; // Du kan använda en lämplig färg här
      } else {
        weatherContainer.style.backgroundColor = 'orangered';
      }

      //Utskrift DOM
      weatherContainer.innerHTML =`<p style="font-weight: bold;"></p> ${weatherInfo}`;

    } else {
      console.error("Väderinformation ej tillgänglig.");
      weatherContainer.innerHTML = "";
    }
  } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Error fetching weather data");
  }
}

