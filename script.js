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
}
function onError() {
  alert("Could not get your location");
}
console.log(navigator);
navigator.geolocation.getCurrentPosition(onSuccess, onError);
