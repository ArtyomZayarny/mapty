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

let map, mapEvent;

//Get current geo position
function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

  map = L.map('map').setView([latitude, longitude], 10);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker([latitude,longitude]).addTo(map)
      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
      .openPopup();

    map.on('click', (mapE) => {
      console.log('mapE', mapE)
      mapEvent = mapE;
      console.log(mapEvent)
      form.classList.remove('hidden');
      inputDistance.focus();
    })


}
function onError() {
  alert("Could not get your location");
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  //Clear input fields
  inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';


  //Display marker
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
});

//Change type
inputType.addEventListener('change', (e)=>{
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
})