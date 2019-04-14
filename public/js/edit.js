/* eslint-disable */
let editModule = {
    map: {},
    session: {},
    cutstart: null,
    cutend: null,
    init: async function() {
        await this.getSession();
        this.map = new EditMap('editMap');
        this.cacheDOM();
        this.drawSession();
        this.bindEvents();
        this.renderSessionInfo();
    },
    cacheDOM: function() {
        this.$sessionInfoName = $('#sessionInfoName');
        this.$sessionInfoStartDate = $('#sessionInfoStartDate');
        this.$sessionInfoEndDate = $('#sessionInfoEndDate');
        this.$sessionInfoDuration = $('#sessionInfoDuration');
        this.$sessionInfoStartLocation = $('#sessionInfoStartLocation');
        this.$sessionInfoEndLocation = $('#sessionInfoEndLocation');
        this.$renameInput = $('#renameInput');
        this.$renameButton = $('#renameSessionModalButton');
        this.$copyInput = $('#copyNameInput');
        this.$copyButton = $('#copySessionModalButton');
        this.$deleteButton = $('#deleteSessionModalButton');
        this.$startLocationInput = $('#startLocationInput');
        this.$endLocationInput = $('#endLocationInput');
        this.$getGeocodeLocationButton = $('#getGeocodeLocationButton');
        this.$addLocationsButton = $('#addLocationsButton');
    },
    bindEvents: function() {
        this.$renameButton.on("click", this.renameSession.bind(this) )
        this.$copyButton.on("click", this.copySession.bind(this) )
        this.$deleteButton.on("click", this.deleteSession.bind(this) )
        this.$getGeocodeLocationButton.on("click", this.getGeocodeLocation.bind(this) )
        this.$addLocationsButton.on("click", this.addLocationsToSession.bind(this) )
        this.map.markerLayer.on("click", this.selectMarkers.bind(this));
    },
    renameSession: async function() {
        try{
            let name = this.$renameInput.val();
            await Session.renameSession(this.session.id, name);
            Swal.fire({
                type: 'success',
                title: 'Success!',
                text: 'Session Renamed!'
            });
            this.session.name = name;
            this.renderSessionInfo();
        }
        catch(err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            })
        }
    },
    copySession: async function() {
        try{
            let name = this.$copyInput.val();
            await Session.copySession(this.session.id, name);
            Swal.fire({
                type: 'success',
                title: 'Success!',
                text: 'Session Copied!'
            });
        }
        catch(err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            })
        }
    },
    deleteSession: async function() {
        try{
            await Session.deleteSession(this.session.id);
            window.location.href = '/overview';
        }
        catch(err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            })
        }
    },
    selectMarkers: function (event) {
        let marker = event.layer;
        if(this.cutstart === null && this.cutend === null) {
            this.cutstart = this.map.markerLayer.getLayers().indexOf(marker);
            marker.selected = true;
            marker.setIcon(this.map.selectedIcon);
            console.log("selection begin", this.map.markerLayer.getLayers().indexOf(marker));
            console.log('first');
        }
        else if(this.cutend === null) {
            this.cutend = this.map.markerLayer.getLayers().indexOf(marker);
            marker.selected = true;
            marker.setIcon(this.map.selectedIcon);
            console.log("selection end", this.map.markerLayer.getLayers().indexOf(marker));
            let markers = this.map.markerLayer.getLayers();
            if(this.cutstart > this.cutend) [this.cutstart, this.cutend] = [this.cutend, this.cutstart];
            for (let i = this.cutstart; i <= this.cutend; i++) {
                markers[i].selected = true;
                markers[i].setIcon(this.map.selectedIcon);
            }
            console.log('second');
    
        }
        else if(this.cutend !== null) {
            let markers = this.map.markerLayer.getLayers();
            // if(this.cutstart > this.cutend) [this.cutstart, this.cutend] = [this.cutend, this.cutstart];
            for (let i = this.cutstart; i <= this.cutend; i++) {
                markers[i].selected = false;
                markers[i].setIcon(this.map.unselectedIcon);
            }
            this.cutstart = this.map.markerLayer.getLayers().indexOf(marker);
            this.cutend = null;
            marker.selected = true;
            marker.setIcon(this.map.selectedIcon);
            console.log("selection begin", this.map.markerLayer.getLayers().indexOf(marker));
            console.log('third');
    
        }
    
        
    },
    getSession: async function() {
        // get sessionId from URL
        let sessionId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
        // get sesson info from api
        this.session = await Session.getSession(sessionId);        
    },
    renderSessionInfo: function() {
        this.$sessionInfoName.text(this.session.name);
        this.$sessionInfoStartDate.text(this.session.startDate);
        this.$sessionInfoEndDate.text(this.session.endDate);
        this.$sessionInfoStartLocation.text(this.session.startLocation);
        this.$sessionInfoEndLocation.text(this.session.endLocation);
        // format duration
        let duration = '';
        if(this.session.duration.days)     duration += ` ${this.session.duration.days}days`;
        if(this.session.duration.hours)    duration += ` ${this.session.duration.hours}h`;
        if(this.session.duration.minutes)  duration += ` ${this.session.duration.minutes}min`;
        if(this.session.duration.seconds)  duration += ` ${this.session.duration.seconds}sec`;
        console.log('duration',duration);
        this.$sessionInfoDuration.text(duration);
    },
    drawSession: function() {
        this.map.drawSession(this.session);
    },
    getGeocodeLocation: async function() {
        // find first and last log in session
        let firstLog = this.session.Logs[0];
        let lastLog = this.session.Logs[this.session.Logs.length - 1];
        try{
            // get addresses from nominatim
            let startLocation = await $.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${firstLog.lat}&lon=${firstLog.lon}`);
            let endLocation = await $.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lastLog.lat}&lon=${lastLog.lon}`);
            // return response.data.address
            this.$startLocationInput.val(startLocation.display_name);
            this.$endLocationInput.val(endLocation.display_name);
        }
        catch(err){
            console.log(err.message);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            })
        }
    },
    addLocationsToSession: async function() {
        try{
            let start = this.$startLocationInput.val();
            let end = this.$endLocationInput.val();
            await Session.addLocations(this.session.id, { start: start, end: end });
            Swal.fire({
                type: 'success',
                title: 'Success!',
                text: 'Locations added!'
            });
            this.session.startLocation = start;
            this.session.endLocation = end;
            this.renderSessionInfo();
        }
        catch(err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            })
        }
    }
}

editModule.init(); 



