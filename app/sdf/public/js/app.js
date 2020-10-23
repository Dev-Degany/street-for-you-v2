let StreetSpeechRecognition;

try {
    StreetSpeechRecognition = webkitSpeechRecognition ? webkitSpeechRecognition : SpeechRecognition;
} catch (error) {
    StreetSpeechRecognition = Object;
}

const recognition = new StreetSpeechRecognition();
const descriptionRecognition = new StreetSpeechRecognition();
descriptionRecognition.continuous = true;
const ZOOM = 15;
const rzMap = L.map("mapid").setView([51.505, -0.09], ZOOM);
const COMFORTABLE = 'COMFORTABLE';
const UNCOMFORTABLE = 'UNCOMFORTABLE';
const MAP_TOKEN =
    "pk.eyJ1Ijoicnpqb3NpYSIsImEiOiJja2dqZHdwdGYwZmxvMnBuNDNvbm16dHR5In0.BYovotHxlYRLns01BpYTJQ";
const WEATHER_TOKEN = "d4354106a2ca9ab50eebfc808698467f";
const cityInput = document.querySelector("#city");
const popup = L.popup();
let isStreetMicOpen = false;

const toggleSpeech = (value) => {
    const micIcon = document.querySelector('#mic-icon');

    if (value) {
        recognition.start();
        micIcon.innerHTML = "mic_off";
    }
    else {
        recognition.stop();
        micIcon.innerHTML = "mic";
    }

    isStreetMicOpen = value;
}

const getLocation = (latitude, longitude) => {
    return fetch(`https://geocode.xyz/${latitude},${longitude}?json=1`)
        .then((data) => data.json())
        .then((data) => data);
}

const getLocationByAddress = (address) => {
    return fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=rsqyf0EI5Am2rdQGwTEuNAzfGR0GpH0J&location=${address}`)
        .then((data) => data.json())
        .then((data) => data.results[0].locations[0]);
}

const getAddressByLocation = (location) => {
    const streeNumber = typeof (location.stnumber) === 'object' || !location.stnumber ? '' : location.stnumber + ' ';
    const address = typeof (location.staddress) === 'object' || !location.staddress ? '' : location.staddress + ', ';
    const zip = typeof (location.postal) === 'object' || !location.postal ? '' : location.postal + ', ';
    const city = typeof (location.city) === 'object' || !location.city ? '' : location.city;

    return location.success === false ? '' : `${streeNumber}${address}${zip}${city}`;
}

const defaultIconParams = {
    iconSize: [25, 47],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'img/marker-shadow.png',
    shadowSize: [1, 34],
    shadowAnchor: [41, 41]
}

const comfortableMarkerIcon = L.icon({
    iconUrl: 'img/marker-icon-green.png',
    ...defaultIconParams
});

const uncomfortableMarkerIcon = L.icon({
    iconUrl: 'img/marker-icon-orange.png',
    ...defaultIconParams
});

const initTileLayer = () => {
    L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
            attribution:
                'Map data &copy; <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/" target="_blank">Mapbox</a>',
            maxZoom: 20,
            id: "rzjosia/ckgjiei9u7ghh19qks3ffeyk4",
            tileSize: 512,
            zoomOffset: -1,
            accessToken: MAP_TOKEN,
        }
    ).addTo(rzMap);
}

const geoLocate = () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            rzMap.setView([position.coords.latitude, position.coords.longitude], ZOOM);
            M.updateTextFields();
        });
    }
}

const addMarker = (data) => {
    const icon = data.situation === COMFORTABLE ? comfortableMarkerIcon : uncomfortableMarkerIcon;
    const markerPoint = L.marker([data.geoPoint.latitude, data.geoPoint.longitude], { icon }).addTo(rzMap);
    markerPoint.bindPopup(`<b>${data.situation === UNCOMFORTABLE ? 'Inconfortale' : 'Confortable'}</b><br/>${data.description}`);
}

const addPlace = async (e, options = {}) => {
    const content = document.createElement('div');
    content.innerHTML = '<div class="input-field col s12">' +
        '<select id="situation">' +
        '<option value="" disabled selected>Selectionner la situation</option>' +
        '<option value="COMFORTABLE">Confortable</option>' +
        '<option value="UNCOMFORTABLE">Inconfortable</option>' +
        '<label>Situation</label>' +
        '</select>' +
        '</div>' +
        '<div class="input-field col s12">' +
        '<textarea id="description" class="materialize-textarea"' +
        'placeholder="Qu\'avez-vous contasté ?"></textarea>' +
        '<button class="btn waves-effect waves-light" id="description-mic-button">' +
        '<i id="description-mic-icon" class="material-icons">mic</i>' +
        '</button>' +
        '</div>';

    if (!options.location) {
        options.location = await getLocation(e.latlng.lat, e.latlng.lng)
    }

    const title = getAddressByLocation(options.location);
    const modal = swal({
        title,
        content,
        buttons: {
            cancel: "Annuler",
            confirm: {
                text: "Ajouter",
                value: "add"
            }
        }
    });

    const elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);

    document.querySelector('#situation').value = options.situation ? options.situation : '';
    document.querySelector('#description').value = options.description ? options.description : '';
    let isDescriptionOpen = false;

    const descriptionToggleSpeech = (value) => {
        const micIcon = document.querySelector('#description-mic-icon');
    
        if (value) {
            descriptionRecognition.start();
            micIcon.innerHTML = "mic_off";
        }
        else {
            descriptionRecognition.stop();
            micIcon.innerHTML = "mic";
        }
    }

    descriptionRecognition.onspeechend = function () {
        console.log("Speech end");
        descriptionToggleSpeech(false)
    }
    
    descriptionRecognition.onresult = (event) => {
        document.querySelector("#description").value = "";
        console.log(event);

        for (const result of event.results) {
            document.querySelector("#description").value += result[0].transcript;
        }
       
        M.textareaAutoResize(document.querySelector("#description"));
    };

    console.log(M)

    document.querySelector('#description-mic-icon').addEventListener('click', function() {
        isDescriptionOpen = !isDescriptionOpen;
        descriptionToggleSpeech(isDescriptionOpen);
    })

    await modal.then(async (modal) => {
        switch (modal) {
            case 'add':
                if (!options.situation || options.situation.trim().length === 0) {
                    options.situation = document.querySelector('#situation').value
                }

                if (!options.description || options.situation.trim().length === 0) {
                    options.description = document.querySelector('#description').value.trim();
                }

                if (options.situation.length === 0) {
                    M.toast({ html: "Oups ! La situation est requise pour ajouter un lieu", classes: 'toast-error' });
                    addPlace(e, options);
                    return;
                }

                addMarker({
                    geoPoint: new firebase.firestore.GeoPoint(e.latlng.lat, e.latlng.lng),
                    situation: options.situation,
                    description: options.description
                });

                await addLocation(
                    e.latlng.lat,
                    e.latlng.lng,
                    options.situation,
                    options.description,
                )
                break;
            default:
                console.log('marker canceled')
        }
    });

    M.updateTextFields();
}

rzMap.on("click", (e) => {
    addPlace(e);
});

cityInput.addEventListener("keyup", async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();

    if (e.keyCode === 13 && city.length > 0) {
        try {
            const location = await getLocationByAddress(city);
            console.log(location);
            rzMap.setView([location.latLng.lat, location.latLng.lng], ZOOM);
        } catch (error) {
            M.toast({ html: "Oups ! Une erreur s'est produite", classes: 'toast-error' });
            console.error(error);
        }
    }
});


initTileLayer();
geoLocate();

getLocations().then((querySnapshot) => {
    querySnapshot.forEach(async (marker) => {
        const data = marker.data();
        if (data.geoPoint && data.geoPoint.latitude && data.geoPoint.longitude) {
            addMarker(data);
        }
    });
});

recognition.onspeechend = function () {
    console.log("Speech end");
    toggleSpeech(false)
}

recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence;
    console.log(transcript);
    try {
        const location = await getLocationByAddress(transcript);
        rzMap.setView([location.latLng.lat, location.latLng.lng], ZOOM);
        cityInput.value = transcript;
    } catch (error) {
        M.toast({ html: "Oups ! Une erreur s'est produite", classes: 'toast-error' });
        console.error(error);
    }
};

document.querySelector('#mic-icon').addEventListener('click', () => {
    isStreetMicOpen = !isStreetMicOpen;
    toggleSpeech(isStreetMicOpen);
});






