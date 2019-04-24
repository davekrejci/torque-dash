/* eslint-disable */
/* eslint-disable */
let MapViewModule = {
    sessions: null,
    currentSession: null,
    map: null,
    chart: null,
    updating: false,
    updateInterval: null,
    shareId: null,
    init: async function() {
        this.shareId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
        //get list of user sessions from api
        this.sessions = await Session.getShareSessions(this.shareId);
        // Initialize datatable
        $('#logTable').DataTable({
            "dom": '<f<t><"my-3"i><"my-3"p>>',
            "bLengthChange": false,
            "pageLength": 5,
            responsive: true,
            ajax: {
                url: `/api/sessions/shared/${this.shareId}`,
                dataSrc: ''
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
                    // put select button in the last column
                    targets: [-1], render: function (data, type, row, meta) {
                        return `<button class="btn btn-primary m-2" onclick="MapViewModule.selectSession(${data.id})">Select</button>`
                    }
            }],
            order: [ 1, "desc" ],
        });
        // Initialize split view
        Split(['#map', '#graph'], {
            direction: 'vertical',
            sizes: [60, 40],
            minSize: [300, 0],
            gutterSize: 10,
            cursor: 'row-resize',
        });
        this.$pidSelectMap = $('#pidSelectMap');
        // Create new Map object in div with id #map
        this.map = new ViewMap('map');
        // Create chart
        this.createChart();
        this.cacheDOM();
        this.bindEvents();
        // Select first session
        this.selectSession(this.sessions[this.sessions.length - 1].id);
        //activate chosen selects
        this.$chosenSelects.chosen();
    },
    cacheDOM: function() {
        this.$loadOverlay = $('#loadOverlay').hide();
        this.$pidSelectMap = $('#pidSelectMap');
        this.$pidSelectChart = $('#pidSelectChart');
        this.$selectSessionModal = $('#selectSessionModal');
        this.$sessionName = $('#sessionName');
        this.$chosenSelects = $(".chosen-select");
        this.$toggleUpdate = $('#toggleUpdate');
    },
    bindEvents: function() {
        $(document).ajaxStart( this.showLoadOverlay.bind(this) );
        $(document).ajaxStop( this.hideLoadOverlay.bind(this) );
        this.$pidSelectMap.on('change', () => { this.map.drawSession(this.currentSession) });
        this.$pidSelectChart.on('change', this.plotChart.bind(this) );
        this.$toggleUpdate.on("click", this.toggleUpdateData.bind(this) );
    },
    toggleUpdateData: function () {
        if(this.updating) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            this.updating = false;
        }
        else {
            this.updateInterval = setInterval(async function() { 
                // Get updated session data
                this.currentSession = await $.get({
                    url: `/api/sessions/shared/${this.shareId}/${this.currentSession.id}`,    
                    global: false
                });
                // Update Map
                this.map.drawSession(this.currentSession);
                // Update Chart
                let timestamps = this.currentSession.Logs.map(log => moment(log.timestamp).format("HH:mm:ss"));
                this.chart.data.labels = timestamps;
                this.plotChart();
            }.bind(this), 5000);
            this.updating = true;
        }
    },
    showLoadOverlay: function() {
        this.$loadOverlay.show();
    },
    hideLoadOverlay: function() {
        this.$loadOverlay.hide();
    },
    selectSession: function(id) {
        this.$selectSessionModal.modal('hide');
        this.currentSession = this.sessions.find(session => session.id == id);
        this.$sessionName.text(this.currentSession.name);
        this.updatePidSelect(this.currentSession);
        this.map.drawSession(this.currentSession);
        let timestamps = this.currentSession.Logs.map(log => moment(log.timestamp).format("HH:mm:ss"));
        if(this.chart) this.chart.destroy();
        this.createChart(timestamps);
        // If session end is less than 30 seconds from now, turn on updating (expect active session)
        if( moment().diff(moment(this.currentSession.endDate,'dd.mm.yyyy HH:mm:ss'), 'seconds') < 30  ) {
            this.toggleUpdateData();
            this.$toggleUpdate.prop( "checked", true );
        }
    },
    updatePidSelect: function(session) {
        // remove current values
        this.$pidSelectMap.empty();
        this.$pidSelectChart.empty();
        //get list of available PIDs
        // get all logged values during session (not every log contains every logged value)
        let allValues = new Array;
        session.Logs.forEach(log => {
            allValues.push(Object.keys(log.values));
        });
        let valueSet = [...new Set([].concat(...allValues))];
        valueSet.forEach(pid => {
            // Add option
            this.$pidSelectMap.append(`<option >${pid}</option>`)
            this.$pidSelectChart.append(`<option>${pid}</option>`)
            
        });
        // select first value for map
        this.$pidSelectMap[0].selectedIndex = 0;
        // refresh select
        this.$chosenSelects.trigger("chosen:updated");
    },
    createChart: function(timestamps) {
        // initial data
        let data = {
            labels: timestamps,
            datasets: []
        };
        // Chart options
        let options = {
            maintainAspectRatio: false,
            tooltips: {
                mode: 'index',
                intersect: false,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                xPadding: 10,
                yPadding: 10,
                position: 'nearest'
            },
            hover: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.Classic10'
                }
            },
            scales: {
                yAxes: [{
                    // stacked: true,
                    gridLines: {
                        display: true,
                        color: "rgba(50,50,50,0.1)"
                    },
                    callbacks: {
                        color: "rgb(255,0,0)"
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: true,
                        color: "rgba(200,200,200,0.1)"
                    },
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 30
                    }
                }]
            }
        };
        this.chart = Chart.Line('chart', {
            type: 'line',
            options: options,
            data: data
        });
        
        // Extend chart to draw line on hover over x axis
        Chart.plugins.register ( {
            afterDatasetsDraw: function(chart) {
                chart_type = chart.config.type;
                if (chart.tooltip._active && chart.tooltip._active.length && chart_type === 'line') {
                var activePoint = chart.tooltip._active[0],
                ctx = chart.chart.ctx,
                x_axis = chart.scales['x-axis-0'],
                y_axis = chart.scales['y-axis-0'],
                x = activePoint.tooltipPosition().x,
                topY = y_axis.top,
                bottomY = y_axis.bottom;
        
                //label color
                y_axis.fontColor = 'red';
                
                // draw line
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY+7);
                ctx.lineTo(x, bottomY+1);
                ctx.setLineDash([2,3]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
                ctx.stroke();
                ctx.restore();
           }
        }
        });
        
        // Extend chart to open map popup on hover
        Chart.plugins.register({
            afterEvent: function(chart, event) {
              // e.type is the type of the event, translated into an internal touch agnostic type. You can probably use 'mousemove'
                let activePoints = chart.getElementsAtEventForMode(event, 'index', { intersect: false })
                if (activePoints[0]) {
                    let chartData = activePoints[0]['_chart'].config.data;
                    let idx = activePoints[0]['_index'];
        
                    let timestamp = chartData.labels[idx];
        
                    let markers = MapViewModule.map.markerLayer.getLayers();
                    let marker = markers.find(marker => marker.timestamp === timestamp);
        
                    marker.openPopup();
                }
            }
        });
    },
    plotChart: function() {
        // get all selected pids
        let selectedPids = this.$pidSelectChart.val();
        
        //reset curretn chart datasets
        this.chart.data.datasets = []
    
        // Create dataset for each pid
        selectedPids.forEach(pid => {
            let data = new Array;
            this.currentSession.Logs.forEach(log => {
                data.push(log.values[pid])
            });
            let dataset = {
                label: pid,
                fill: false,
                pointHoverRadius: 5,
                data: data
            };
            this.chart.data.datasets.push( dataset );
            this.chart.update({ duration: 0 });
        });
    
    }
}
$( document ).ready(function() {
    MapViewModule.init();
});
