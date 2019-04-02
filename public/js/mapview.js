/* eslint-disable */
let sessions = new Array;
let currentSession = {};
let map = {};

$(document).ready(async function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    // Initialize datatable
    $('#logTable').DataTable({
        "dom": '<f<t><"my-3"i><"my-3"p>>',
        "bLengthChange": false,
        "pageLength": 5,
        responsive: true
    });
    
    //get list of user sessions from api
    sessions = await Session.getSessions();

    // Create new Map object in div with id #map
    map = new Map('map');

    $('#pidSelectMap').on('change', function(e){ map.drawSession(currentSession) });
    

});

function selectSession(id) {
    $('#selectSessionModal').modal('hide');
    currentSession = sessions.find(session => session.id == id);
    $('#sessionName').text(currentSession.name);
    updatePidSelect(currentSession);
    map.drawSession(currentSession);
}

function updatePidSelect(session) {
    // remove current values
    $('#pidSelectMap').empty();
    //get list of available PIDs from first log
    session.Logs[0]
    for (const pid in session.Logs[0]) {
        // Skip location, time and identification values
        if(!(['gpsLongitude','gpsLatitude','id','timestamp', 'sessionId', 'createdAt', 'updatedAt'].includes(pid))) {
            // Add option
            $('#pidSelectMap').append(`<option >${pid}</option>`)
        }
    }
    // refresh selectpicker
    $('.selectpicker').selectpicker('refresh');
    // select first value
    $("#pidSelectMap")[0].selectedIndex = 1;
    // refresh again to show selected value
    $('.selectpicker').selectpicker('refresh');
}


class Map {
    constructor(container) {
        // Get base tiles
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
        
        // initialize the map in the container
        this.map = L.map(container, mapOptions);

        // Create a layer for markers
        this.markerLayer = L.layerGroup().addTo(this.map);
        // Create a layer for the session path
        this.pathLayer = L.layerGroup().addTo(this.map);
        
        let overlayLayers = {
            'Markers': this.markerLayer,
            'Path': this.pathLayer
        }
        
        // Add base tile layer controls
        let tileLayers = {
            "Wikimedia": wikimediaTileLayer,
            "Open Map Surfer Roads": openMapSurferRoadsTileLayer,
            "CartoDB Voyager": cartoDBVoyager,
            "Esri World Imagery": esriWorldImagery
        }
        L.control.layers(tileLayers, overlayLayers).addTo(this.map);
        // Add zoom control
        new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

        // Add Session Control
        var sessionControl =  L.Control.extend({        
            options: {
              position: 'topleft'
            },
            onAdd: function (map) {
                let container = L.DomUtil.create('div', 'w-75 p-3');

                // let sessionSelect = L.DomUtil.create('button', 'btn btn-light custom-map-control my-1');
                // sessionSelect.id = 'sessionSelectButton';
                // sessionSelect.dataset.toggle = 'modal';   
                // sessionSelect.dataset.target = '#selectSessionModal';
                // sessionSelect.innerText = 'Select Session';

                let pidSelect = L.DomUtil.create('select', 'form-input selectpicker custom-map-control my-1');
                pidSelect.id = 'pidSelectMap';
                pidSelect.title = 'Select PID';

                // container.appendChild(sessionSelect);
                container.appendChild(pidSelect);
            
                return container;
            }
        });
        this.map.addControl(new sessionControl());

        
        
       

        // Resize map on width change (resizeobserver only works in chromium atm)
        new ResizeObserver(() => {
            this.map.invalidateSize();
        }).observe(document.getElementById(container));

    }

    drawSession(session) {
        // Remove current session layer
        this.markerLayer.clearLayers();
        this.pathLayer.clearLayers();
        console.log(session);


        // The value to be color graded on path
        let mappedValue = $('#pidSelectMap').val();
        let min = session.Logs[0][mappedValue];
        let max = session.Logs[0][mappedValue];
        

        // Loop through all logs in session
        let coordinates = new Array;
        session.Logs.forEach(log => {

            if(log[mappedValue] > max) max = log[mappedValue];
            if(log[mappedValue] < min) min = log[mappedValue];

            // Create array of coordinates + value for creating color graded path
            coordinates.push([log.gpsLatitude, log.gpsLongitude, log[mappedValue]]);

            // Add markers at each log position
            L.marker([log.gpsLatitude, log.gpsLongitude], {icon: L.divIcon({ className: 'map-marker' })})
                .bindPopup(`<p>${mappedValue}: ${log[mappedValue]}</p>`)
                .on('mouseover', function (e) { this.openPopup(); })
                .on('mouseout', function (e) { this.closePopup(); })
                .addTo(this.markerLayer);
        });

        // hotline color assignemnt crashes if only one pid value for every timestamp
        if(max === min) {
            min = 0;
            max = 100;
        }

        // Create polyline over session path
        let path = L.hotline(coordinates, {
            weight: 5,
            outlineWidth: 0,
            palette: {
                0.0: 'green',
                0.5: 'yellow',
                1.0: 'red'
            },
            min: min,
            max: max
        }).addTo(this.pathLayer);


        // zoom the map to the polyline
        this.map.fitBounds(path.getBounds());
    }
}






// ============== CHART =================== //
// TODO: move to separate js file

var ctx = document.querySelector('#testChart').getContext('2d');
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