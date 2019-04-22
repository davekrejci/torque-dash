/* eslint-disable */
let sessions = new Array;
let currentSession = {};
let map = {};
let chart = {};


$(document).ready(async function () {
    
    // Initialize datatable
    const shareId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
    let url = `/api/sessions/shared/${shareId}`;
    $('#logTable').DataTable({
        "dom": '<f<t><"my-3"i><"my-3"p>>',
        "bLengthChange": false,
        "pageLength": 5,
        responsive: true,
        ajax: {
            url: url,
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
                    return `<button class="btn btn-primary m-2" onclick="selectSession(${data.id})">Select</button>`
                }
        }],
    });

    Split(['#map', '#graph'], {
        direction: 'vertical',
        sizes: [60, 40],
        minSize: [300, 0],
        gutterSize: 10,
        cursor: 'row-resize',

    });

    let loadOverlay = $('#loadOverlay').hide();
    $(document).ajaxStart( () => loadOverlay.show() );
    $(document).ajaxStop( () => loadOverlay.hide() );

    
    //get list of user sessions from api
    sessions = await Session.getShareSessions(shareId);
    
    // Create new Map object in div with id #map
    map = new ViewMap('map');
    chart = new MyChart();
    
    //activate chosen selects
    $(".chosen-select").chosen();
    
    $('#pidSelectMap').on('change', function (e) {
        map.drawSession(currentSession)
    });
    $('#pidSelectChart').on('change', function (e) {
        /* redraw chart with current selected values */
        plotChart();
        
    });


});

function selectSession(id) {
    $('#selectSessionModal').modal('hide');
    currentSession = sessions.find(session => session.id == id);
    $('#sessionName').text(currentSession.name);
    updatePidSelect(currentSession);
    map.drawSession(currentSession);

    let timestamps = currentSession.Logs.map(log => moment(log.timestamp).format("HH:mm:ss"));
    console.log('timestamps', timestamps);
    if(chart) chart.destroy();
    chart = new MyChart(timestamps); 
}

function updatePidSelect(session) {
    // remove current values
    $('#pidSelectMap').empty();
    $('#pidSelectChart').empty();
    //get list of available PIDs
    // get all logged values during session (not every log contains every logged value)
    let allValues = new Array;
    session.Logs.forEach(log => {
        allValues.push(Object.keys(log.values));
    });
    let valueSet = [...new Set([].concat(...allValues))];
    valueSet.forEach(pid => {
        // Add option
        $('#pidSelectMap').append(`<option >${pid}</option>`)
        $('#pidSelectChart').append(`<option>${pid}</option>`)
        
    });
    // select first value for map
    $("#pidSelectMap")[0].selectedIndex = 0;
    // refresh select
    $('.chosen-select').trigger("chosen:updated");
}



function plotChart() {
    // get all selected pids
    let selectedPids = $('#pidSelectChart').val();
    
    //reset curretn chart datasets
    chart.data.datasets = []

    // Create dataset for each pid
    selectedPids.forEach(pid => {
        let data = new Array;
        currentSession.Logs.forEach(log => {
            data.push(log.values[pid])
        });
        let dataset = {
            label: pid,
            fill: false,
            pointHoverRadius: 5,
            data: data
        }
        chart.data.datasets.push( dataset )
        
        chart.update();
    });

}




// ============== CHART =================== //
// TODO: move to separate js file

class MyChart {
    constructor(timestamps) {
        // initial data
        var data = {
            labels: timestamps,
            datasets: []
        };
        // Chart options
        var options = {
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

        let chart = Chart.Line('chart', {
            type: 'line',
            options: options,
            data: data
        });
        return chart;
    }
}

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

            let markers = map.markerLayer.getLayers();
            let marker = markers.find(marker => marker.timestamp === timestamp);

            marker.openPopup();
        }
    }
  });


