let searchInput;
let storedCoordinates = JSON.parse(localStorage.getItem('storedCoordinates')) || [];
let pastSelect = JSON.parse(localStorage.getItem('pastSelect')) || [];
let lat, lon;
let cnt = 0;
const requestOptions = {
    method: 'GET',
    redirect: 'follow'
};
// Function to create future forecast boxes
function createForecastBoxes() {
    for (let i=1;i<6;i++) {
        const div1 = $('<div>').addClass('col card mx-1');
        const h6 = $('<h6>').addClass('card-header bg-info text-dark text-center').attr('id', 'h6' + i);
        const div2 = $('<div>').addClass('card-body text-dark bg-light');
        const sun = $('<img>').attr('id', 'sun' + i);
        const temp = $('<p>').attr('id', 'temp' + i);
        const wind = $('<p>').attr('id', 'wind' + i);
        const hum = $('<p>').attr('id', 'hum' + i);

        div2.append(sun, temp, wind, hum);
        div1.append(h6, div2);
        $('#5dayBody').append(div1);
    }
}
// Check local data and initialize
function initialize() {
    if (pastSelect.length>0) {
        lat = pastSelect[0].lat;
        lon = pastSelect[0].lon;
        processStored();
    } else if (storedCoordinates.length>0) {
        processStored();
    } else {
        lat = 25.761680;
        lon = -80.191790;
        getWeather();
    }
}
// Process stored coordinates
function processStored() {
    lat = storedCoordinates[0].lat;
    lon = storedCoordinates[0].lon;
    displayPastSearches();
    getWeather();
}
// Display past searches
function displayPastSearches() {
    for (let cnt = 0; cnt < storedCoordinates.length; cnt++) {
        const li = $('<li>').addClass('add-project-btn');
        const btn = $('<button>').addClass('btn btn-secondary px-5 py-1 my-1 text-light').attr('id', cnt);
        btn.text(storedCoordinates[cnt].city);

        btn.on('click', function () {
            const id = this.id;
            lat = storedCoordinates[id].lat;
            lon = storedCoordinates[id].lon;
            getWeather();
        });

        li.append(btn);
        $('#ul-custom').append(li);
    }
}
// Search button click handler
$('#searchBtn').on('click', function () {
    searchInput = $('#searchInp').val();
    if (searchInput.length > 0) {
        getCoordinates();
    }
});
// Fetch coordinates for a city
function getCoordinates() {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchInput},US&limit=1&appid=0fffe1b055508f25ee7dfb0b1801b7ae`, requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result.length < 1) {
                alert('City not found');
                throw 'No such city name.';
            } else {
                const { lat, lon, name: city } = result[0];
                const coordinates = { city, lat, lon };
                storedCoordinates.unshift(coordinates);
                storedCoordinates.splice(8);
                localStorage.setItem('storedCoordinates', JSON.stringify(storedCoordinates));
                processStored();
            }
        })
        .catch(error => console.log('error', error));
}
// Fetch weather details
function getWeather() {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=0fffe1b055508f25ee7dfb0b1801b7ae&units=imperial`, requestOptions)
        .then(response => response.json())
        .then(result => {
            $('#cityName').text(`${result.name} (${dayjs(result.dt * 1000).format('MM/DD/YYYY')})`);
            $('#emoji').attr('src', `http://openweathermap.org/img/w/${result.weather[0].icon}.png`);
            $('#temp0').text(`Temp: ${result.main.temp} °F`);
            $('#wind0').text(`Speed: ${result.wind.speed} mph`);
            $('#hum0').text(`Humidity: ${result.main.humidity} %`);

            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=0fffe1b055508f25ee7dfb0b1801b7ae&units=imperial`, requestOptions);
        })
        .then(response => response.json())
        .then(result => {
            for (let i = 1; i < 6; i++) {
                const iPlus = (i - 1) * 8;
                $(`#h6${i}`).text(dayjs(result.list[iPlus].dt_txt).format('MM/DD/YYYY'));
                $(`#sun${i}`).attr('src', `http://openweathermap.org/img/w/${result.list[iPlus].weather[0].icon}.png`);
                $(`#temp${i}`).text(`Temp: ${result.list[iPlus].main.temp} °F`);
                $(`#wind${i}`).text(`Wind: ${result.list[iPlus].wind.speed} mph`);
                $(`#hum${i}`).text(`Humidity: ${result.list[iPlus].main.humidity} %`);
            }
        })
        .catch(error => console.log('error', error));
}
// Initialize the application
$(document).ready(function () {
    createForecastBoxes();
    initialize();
});