/* eslint-disable */
$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
});

mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2ZWtyZWpjaSIsImEiOiJjanQ5cndycm0wM2UzM3lwNHZnNHBlNDV5In0.b5_xPuoJV9F97N25rBLJ_g';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
    center: [14.43, 50.07], // starting position [lng, lat]
    zoom: 5 // starting zoom
});

new ResizeObserver(() => {
    map.resize();
}).observe(document.querySelector('#map'));

// window.addEventListener('resize', () => {
//     map.resize();
//     console.log('resizing!');
// })