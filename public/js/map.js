/* eslint-disable */
$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
});

// mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2ZWtyZWpjaSIsImEiOiJjanQ5cndycm0wM2UzM3lwNHZnNHBlNDV5In0.b5_xPuoJV9F97N25rBLJ_g';
// // initialize the map on the "map" div with a given center and zoom
// var map = new mapboxgl.Map({
//     container: 'map', // container id
//     style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
//     center: [18.26, 49.82], // starting position [lng, lat]
//     zoom: 10 // starting zoom
// });
// // Add zoom and rotation controls to the map.
// map.addControl(new mapboxgl.NavigationControl());
// // Add marker

var esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var cartoDBVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});
var openMapSurferRoadsTileLayer = L.tileLayer('https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png', {
    maxZoom: 19,
	attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let wikimediaTileLayer = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
	minZoom: 1,
	maxZoom: 19
});
// Set map options
let mapOptions = {
    center: [49.82, 18.26],
    zoom: 10,
    zoomControl: false,
    layers: [wikimediaTileLayer]
}

// initialize the map on the "map" div
let map = L.map('map', mapOptions);


let tileLayers = {
    "Wikimedia": wikimediaTileLayer,
    "Open Map Surfer Roads": openMapSurferRoadsTileLayer,
    "CartoDB Voyager": cartoDBVoyager,
    "Esri World Imagery": esriWorldImagery
}

L.control.layers(tileLayers).addTo(map);
new L.Control.Zoom({ position: 'topright' }).addTo(map);



// Resize map on width change
// ** ResizeObserver only works in chrome atm **
new ResizeObserver(() => {
    map.invalidateSize();
}).observe(document.querySelector('#map'));





// ============== CHART =================== //
// TODO: move to separate js file

var ctx = document.getElementById('testChart').getContext('2d');
var testChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});