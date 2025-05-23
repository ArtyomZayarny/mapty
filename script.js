"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

//Get current geo position
function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

  const map = L.map('map').setView([latitude, longitude], 10);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker([latitude,longitude]).addTo(map)
      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
      .openPopup();

  //Add click event for map
  map.on('click', (mapEvent) => {
    console.log(mapEvent);
    const { lat, lng } = mapEvent.latlng;
    L.marker([lat,lng]).addTo(map).bindPopup(L.popup({
      maxWidth:250,
      minWidth:100,
      autoClose:false,
      closeOnClick: false,
      className:'running-popup'
    }))
        .setPopupContent('Workout')
        .openPopup();
  })
}
function onError() {
  alert("Could not get your location");
}
console.log(navigator);
navigator.geolocation.getCurrentPosition(onSuccess, onError);


