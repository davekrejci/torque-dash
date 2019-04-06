/* eslint-disable */
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
                let container = L.DomUtil.create('div', 'w-75');

                // <div id="sessionName" class="badge badge-light p-2 w-100 mb-2">No session selected</div>

                let sessionName = L.DomUtil.create('div', 'badge badge-light p-2 custom-map-control my-1 w-75 font-weight-bold text-uppercase');
                sessionName.innerText = 'No session selected';
                sessionName.id = 'sessionName';

                let sessionSelect = L.DomUtil.create('button', 'btn btn-light custom-map-control my-1 w-75 ');
                sessionSelect.id = 'sessionSelectButton';
                sessionSelect.dataset.toggle = 'modal';   
                sessionSelect.dataset.target = '#selectSessionModal';
                sessionSelect.innerText = 'Select Session';

                let pidSelect = L.DomUtil.create('select', 'form-input selectpicker custom-map-control my-1 w-75');
                pidSelect.id = 'pidSelectMap';
                pidSelect.title = 'Select PID';

                // container.appendChild(sessionSelect);
                container.appendChild(sessionSelect);
                container.appendChild(sessionName);
                container.appendChild(pidSelect);
            
                return container;
            }
        });
        this.map.addControl(new sessionControl());

        // Add mappedValueBar
        var mappedValueBar =  L.Control.extend({        
            options: {
              position: 'bottomleft'
            },
            onAdd: function () {
                let container = L.DomUtil.create('div', 'd-flex');
                let bar = L.DomUtil.create('div', 'gradient');
                let valueContainer = L.DomUtil.create('div', 'd-flex align-items-start flex-column');
                let maxValue = L.DomUtil.create('div', 'mb-auto ml-1 maptext');
                let minValue = L.DomUtil.create('div', 'mt-auto ml-1 maptext');
                maxValue.id = 'maxValue';
                minValue.id = 'minValue';
                container.appendChild(bar);
                container.appendChild(valueContainer);
                valueContainer.appendChild(maxValue);
                valueContainer.appendChild(minValue);
                return container;
            }
        });
        this.map.addControl(new mappedValueBar());

        // Add functionality for calculating polyline distance
        L.Polyline = L.Polyline.include({
            getDistance: function(system) {
                // distance in meters
                var distance = 0;
                for (var i = 1; i < this._latlngs.length; i++) {
                    distance += this._latlngs[i].distanceTo(this._latlngs[i - 1]);
                }
                return Math.floor(distance);
            }
        }); 

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
        
        // hotline color assignement fails if only one pid value for every timestamp so assign 0-100
        if(max === min) {
            min = 0;
            max = 100;
        }
        
        // Update min/max description
        $('#minValue').text(min);
        $('#maxValue').text(max);
        
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
