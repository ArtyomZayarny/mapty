"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user position
    this._getPosition();

    // Get local storage data
    this._getLocalStorage();

    // Attach events handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    //Change type
    inputType.addEventListener('change', this._toggleElevationField)
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _onErrorGeo(){
    alert("Could not get your location");
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), this._onErrorGeo);
    }
  }

  _loadMap(position){
    const { latitude, longitude } = position.coords;
    this.#map = L.map('map').setView([latitude, longitude], this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    L.marker([latitude,longitude]).addTo(this.#map)
        .bindPopup('A pretty CSS popup.<br> Easily customizable.')
        .openPopup();

    this.#map.on('click', this._showForm.bind(this))

    //Render the markers
    this.#workouts.forEach(workout => {
      this._renderWorkoutMarker(workout)
    })

  }

  _showForm(mapE){
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //Empty inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(()=> (form.style.display = 'grid'),1000)
  }

  _toggleElevationField(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
  }

  _newWorkout(e){
    const validInputs = (...inputs)=>inputs.every(inp =>Number.isFinite(inp))
    const allPositive = (...inputs) => inputs.every(inp => inp >0);
    e.preventDefault();
    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const {lat, lng } = this.#mapEvent.latlng;
    let workout;

    //If activity running,create running object
    if(type === 'running') {
      const cadence = +inputCadence.value;

      //Check if data is valid
      (!validInputs(distance,duration,cadence) || !allPositive(distance,duration,cadence) ) && alert('Inputs have to be positive')
       workout = new Running([lat,lng], distance, duration,cadence)

    }

    //If workout - cycling, create cycling object
    if(type === 'cycling') {
      const elevation = +inputElevation.value;

      (!validInputs(distance,duration,elevation) || !allPositive(distance,duration) )&& alert('Inputs have to be positive')
      workout = new Cycling([lat,lng], distance,duration, elevation);
    }

    //Add new object to workout array
    this.#workouts.push(workout);

    //Render workout on map as marker
    this._renderWorkoutMarker(workout);

    //Render workout on list
    this._renderWorkout(workout);

    //Hide form + clear input fields
    this._hideForm();

    //Set local storage to all workouts
    this._setLocalStorage()
  }

  _renderWorkoutMarker(workout) {
      L.marker(workout.coords)
          .addTo(this.#map)
          .bindPopup(
              L.popup({
                maxWidth:250,
                minWidth:100,
                autoClose:false,
                closeOnClick: false,
                className:`${workout.type}-popup`
               })
          )
        .setPopupContent(`${workout.type === 'running' ? '🏃‍': '🚴‍♀️'}️ ${workout.description}`)
        .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍': '🚴‍♀️'}️</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;
    if (workout.type === 'running')
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    if(workout.type === 'cycling')
      html += `
       <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    form.insertAdjacentHTML('afterend',html);
  }

  _moveToPopup(e){
    const workoutEl = e.target.closest('.workout');
    if(!workoutEl) return;
    const workout = this.#workouts.find(w=>w.id === workoutEl.dataset.id);
    this.#map.setView(workout.coords,this.#mapZoomLevel,
        {
          animate:true,
          pan: {
            duration:1
          }
        });
    // using  public interface
   // workout.click()
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage(){
    const data = JSON.parse(localStorage.getItem('workouts'));

    if(!data) return;

    this.#workouts = data;

    //Render workouts
    this.#workouts.forEach((workout) => {
      this._renderWorkout(workout)
    });

  }

  reset() {
    localStorage.removeItem('workouts');
    // Reload the page
    location.reload();
  }
}

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  //clicks = 0;

  constructor(coords, distance, duration) {
      this.coords = coords; // [lat,lng]
      this.distance = distance; // in km
      this.duration = duration; // in min
  }
  _setDescription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
  click(){
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration,cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace(){
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling'
  constructor(coords, distance, duration,elevationGain, speed) {
    super(coords, distance, duration,elevationGain);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed(){
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const app = new App();

