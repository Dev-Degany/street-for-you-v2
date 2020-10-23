firebase.initializeApp({
    apiKey: "AIzaSyCfiaKA-nFmjjs2Q37DQo-kUf6AarFWbq8",
    authDomain: "help-sdf-app.firebaseapp.com",
    projectId: "help-sdf-app",
});

const db = firebase.firestore();

const addLocation = (lat, lng, situation, description) => {
    const geoPoint = new firebase.firestore.GeoPoint(lat, lng);
    return db.collection("location")
        .add({
            geoPoint,
            situation: situation,
            description: description,
        });
}

const getLocations = () => {
    return db.collection("location").get();
}