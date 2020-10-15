var httpRequest;
var idPhotos = document.getElementById("photos");

function fetchPhotos(e) {
    e.preventDefault();

    idPhotos.innerHTML = "";
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        console.error("Abandon :( Impossible de créer une instance de XMLHTTP");
        return false;
    }

    var API_KEY = "2850754-39913d8895887853124870260";
    var URL =
        "https://pixabay.com/api/?key=" +
        API_KEY +
        "&q=" +
        encodeURIComponent(document.getElementById('inputSearchPhoto').value.trim());
    httpRequest.onreadystatechange = getPhotosContents;
    httpRequest.open("GET", URL, true);
    httpRequest.send();
}

function displayNoPhotos() {
    idPhotos.innerHTML = "<p >aucune photo disponible</p>";
}

function getPhotosContents() {
    switch (httpRequest.readyState) {
        case XMLHttpRequest.DONE:
            switch (httpRequest.status) {
                case 200:
                    updatePixabayPhotos(JSON.parse(httpRequest.responseText));
                    break;
                default:
                    displayNoPhotos();
                    break;
            }
            break;
    }
}

function updatePixabayPhotos(jsonResponse) {
    if (jsonResponse.hits.length <= 0) {
        displayNoPhotos();
        return;
    }

    jsonResponse.hits.map(function (photo) {
        var div = document.createElement('div');
        div.setAttribute('class', 'col s4 m3');
        
        var a = document.createElement('a');
        a.setAttribute('href', photo.pageURL);
        a.setAttribute('target', '_blank');

        var img = document.createElement("img");
        img.setAttribute('class', 'img-thumbnail');
        img.src = photo.previewURL;

        a.append(img);
        div.append(a);
        idPhotos.append(div);
    });
}


document.getElementById("btnSearch").onclick = fetchPhotos;