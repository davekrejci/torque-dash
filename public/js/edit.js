/* eslint-disable */
let editModule = {
    map: {},
    session: {},
    joinSession: {},
    cutstart: null,
    cutend: null,
    init: async function() {
        await this.getSession();
        this.map = new EditMap('editMap');
        this.cacheDOM();
        this.initLogTable();
        this.drawSession();
        this.bindEvents();
        this.renderSessionInfo();
    },
    cacheDOM: function() {
        this.$loadOverlay = $('#loadOverlay').hide();
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
        this.$filterNumberSlider = $('#filterNumberSlider');
        this.$filterNumberLabel = $('#filterNumberLabel');
        this.$filterButton = $('#filterSessionModalButton');
        this.$cutModal = $('#cutSessionModal');
        this.$cutButton = $('#cutSessionModalButton');
        this.$joinButton = $('#joinButton');
        this.$joinConfirmButton = $('#joinSessionModalButton');
        this.$joinedNameInput = $('#joinedNameInput');
        this.$logTable = $('#logTable');
    },
    bindEvents: function() {
        $(document).ajaxStart( this.showLoadOverlay.bind(this) );
        $(document).ajaxStop( this.hideLoadOverlay.bind(this) );
        this.$renameButton.on("click", this.renameSession.bind(this) );
        this.$copyButton.on("click", this.copySession.bind(this) );
        this.$deleteButton.on("click", this.deleteSession.bind(this) );
        this.$getGeocodeLocationButton.on("click", this.getGeocodeLocation.bind(this) );
        this.$addLocationsButton.on("click", this.addLocationsToSession.bind(this) );
        this.map.markerLayer.on("click", this.selectMarkers.bind(this));
        this.$filterNumberSlider.on('input', this.updateFilterLabel.bind(this) );
        this.$filterButton.on("click", this.filterSession.bind(this) );
        this.$cutModal.on('show.bs.modal', this.populateCutModal.bind(this) );
        this.$cutButton.on("click", this.cutSession.bind(this) );
        this.$joinConfirmButton.on("click", this.joinSession.bind(this) );
        
    },
    initLogTable: async function() {
        this.$logTable.DataTable({
            "dom": '<f<t><"my-3"i><"my-3"p>>',
            "bLengthChange": false,
            "pageLength": 5,
            responsive: true,
            ajax: {
                url: '/api/sessions',
                dataSrc: function (json) {
                    var return_data = new Array();
                    for(var i=0;i< json.length; i++){
                      return_data.push({
                        'id': json[i].id,
                        'name': json[i].name,
                        'startDate': moment(json[i].startDate).format('DD.MM.YYYY HH:mm:ss'),
                        'endDate': moment(json[i].endDate).format('DD.MM.YYYY HH:mm:ss'),
                        'duration': json[i].duration,
                        'startLocation': json[i].startLocation,
                        'endLocation': json[i].endLocation
                      })
                    }
                    return return_data;
                  }
            },
            columns: [
                { data: 'name' },
                { data: 'startDate' },
                { data: 'endDate' },
                { data: 'duration' },
                { data: 'startLocation' },
                { data: 'endLocation' },
                { data: null },
            ],
            columnDefs: [
                {
                    // puts buttons in the last column
                    targets: [-1], render: function (data, type, row, meta) {
                        return `<button class="btn btn-primary m-2" data-dismiss="modal" onclick="editModule.selectJoinSession(${data.id})">Select</button>`
                    }
            }],
        });
    },
    selectJoinSession: async function(id) {
        try{
            this.joinSession = await Session.getSession(id);
            this.drawJoinSession();
            this.$joinButton.attr('disabled', false);
        }
        catch(err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            });
        }
    },
    joinSession: async function() {
        try{
            await Session.joinSession(
                this.session.id,
                this.joinSession.id, 
                this.$joinedNameInput.val()
            );
            Swal.fire({
                type: 'success',
                title: 'Success!',
                text: 'Sessions joined!'
            });
        }
        catch(err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            });
        }
    },
    cutSession: async function() {
        try{
            let from = this.session.Logs[this.cutstart].timestamp;
            let to = this.session.Logs[this.cutend].timestamp;
            await Session.cutSession(this.session.id, from, to);
            Swal.fire({
                type: 'success',
                title: 'Success!',
                text: 'Session cut!'
            });
            this.cutstart = null;
            this.cutend = null;
            await this.getSession();
            this.renderSessionInfo();
            this.drawSession();
        }
        catch(err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            });
        }
    },
    populateCutModal: function() {
        if(this.cutstart === null || this.cutend === null) {
            this.$cutModal.find('#cutMessage').text("Oops, looks like you haven't made a selection!");
            this.$cutButton.attr("disabled", true);
        }
        else {
            let startTime = this.session.Logs[this.cutstart].timestamp;
            let endTime = this.session.Logs[this.cutend].timestamp;
            let message = `Cut session from ${moment(startTime).format('HH:mm:ss')} to ${moment(endTime).format('HH:mm:ss')}?`
            this.$cutModal.find('#cutMessage').text(message);
            this.$cutButton.attr("disabled", false);
        }
    },
    updateFilterLabel: function() {
        this.$filterNumberLabel.text(this.$filterNumberSlider.val());
    },
    showLoadOverlay: function() {
        this.$loadOverlay.show();
    },
    hideLoadOverlay: function() {
        this.$loadOverlay.hide();
    },
    filterSession: async function() {
        try{
            let filterNumber = this.$filterNumberSlider.val();
            await Session.filterSession(this.session.id, filterNumber);
            Swal.fire({
                type: 'success',
                title: 'Success!',
                text: 'Session filtered!'
            });
            await this.getSession();
            this.renderSessionInfo();
            this.drawSession();
        }
        catch(err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            });
        }
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
            });
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
            });
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
            });
        }
    },
    selectMarkers: function (event) {
        let marker = event.layer;
        if(this.cutstart === null && this.cutend === null) {
            this.cutstart = this.map.markerLayer.getLayers().indexOf(marker);
            marker.selected = true;
            marker.setIcon(this.map.selectedIcon);
        }
        else if(this.cutend === null) {
            this.cutend = this.map.markerLayer.getLayers().indexOf(marker);
            marker.selected = true;
            marker.setIcon(this.map.selectedIcon);
            let markers = this.map.markerLayer.getLayers();
            if(this.cutstart > this.cutend) [this.cutstart, this.cutend] = [this.cutend, this.cutstart];
            for (let i = this.cutstart; i <= this.cutend; i++) {
                markers[i].selected = true;
                markers[i].setIcon(this.map.selectedIcon);
            }
    
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
        this.$sessionInfoStartDate.text(moment(this.session.startDate).format('DD.MM.YYYY HH:mm:ss'));
        this.$sessionInfoEndDate.text(moment(this.session.endDate).format('DD.MM.YYYY HH:mm:ss'));
        this.$sessionInfoStartLocation.text(this.session.startLocation);
        this.$sessionInfoEndLocation.text(this.session.endLocation);
        this.$sessionInfoDuration.text(this.session.duration);
    },
    drawSession: function() {
        this.map.drawSession(this.session);
    },
    drawJoinSession: function() {
        this.map.drawJoinSession(this.joinSession);
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



