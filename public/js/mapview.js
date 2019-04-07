/* eslint-disable */
let sessions = new Array;
let currentSession = {};
let map = {};
let chart = {};


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

    Split(['#map', '#graph'], {
        direction: 'vertical',
        sizes: [60, 40],
        minSize: [300, 0],
        gutterSize: 10,
        cursor: 'row-resize',

    });

    //get list of user sessions from api
    sessions = await Session.getSessions();

    // Create new Map object in div with id #map
    map = new Map('map');
    chart = new MyChart();

    $('#pidSelectMap').on('change', function (e) {
        map.drawSession(currentSession)
    });
    $('#pidSelectChart').on('change', function (e) {
        /* redraw chart with current selected values */
        console.log($('#pidSelectChart').val());
        
    });


});

function selectSession(id) {
    $('#selectSessionModal').modal('hide');
    currentSession = sessions.find(session => session.id == id);
    $('#sessionName').text(currentSession.name);
    updatePidSelect(currentSession);
    map.drawSession(currentSession);

    let timestamps = currentSession.Logs.map(log => moment(log.timestamp).format("hh:mm:ss"));
    console.log('timestamps', timestamps);
    if(chart) chart.destroy();
    chart = new MyChart(timestamps); 
}

function updatePidSelect(session) {
    // remove current values
    $('#pidSelectMap').empty();
    $('#pidSelectChart').empty();
    //get list of available PIDs from first log
    for (const pid in session.Logs[0].values) {
        // Add option
        $('#pidSelectMap').append(`<option >${pid}</option>`)
        $('#pidSelectChart').append(`<option data-content="<span class='badge badge-pill badge-light p-2'>${pid}</span>">${pid}</option>`)
    }
    // refresh selectpicker
    $('.selectpicker').selectpicker('refresh');
    // select first value for map
    $("#pidSelectMap")[0].selectedIndex = 1;
    // refresh again to show selected value
    $('.selectpicker').selectpicker('refresh');
}



function plotChart() {
    // get all selected pids
    let selectedPids = $('#pidSelectChart').val();
    console.log(selectedPids);
    // Create dataset for each pid
    selectedPids.forEach(pid => {
        let data = currentSession.Logs.map(log => log[pid]);
        let dataset = {
            label: pid,
            data: data
        }
        console.log(dataset);
    });



    let speeds = currentSession.Logs.map(log => log.speed);

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
            scales: {
                yAxes: [{
                    stacked: true,
                    gridLines: {
                        display: true,
                        color: "rgba(255,99,132,0.2)"
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: false
                    }
                }]
            }
        };

        let chart = Chart.Line('chart', {
            options: options,
            data: data
        });
        return chart;
    }
}