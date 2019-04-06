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
        /* redraw chart with current selected values */ });


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
    $('#pidSelectChart').empty();
    //get list of available PIDs from first log
    session.Logs[0]
    for (const pid in session.Logs[0]) {
        // Skip location, time and identification values
        if (!(['gpsLongitude', 'gpsLatitude', 'id', 'timestamp', 'sessionId', 'createdAt', 'updatedAt'].includes(pid))) {
            // Add option
            $('#pidSelectMap').append(`<option >${pid}</option>`)
            $('#pidSelectChart').append(`<option data-content="<span class='badge badge-pill badge-primary p-2'>${pid}</span>">${pid}</option>`)
        }
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
        
    });



    let speeds = currentSession.Logs.map(log => log.speed);

}




// ============== CHART =================== //
// TODO: move to separate js file

class MyChart {
    constructor() {
        // initial data
        var data = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            datasets: [{
                label: "Dataset #1",
                backgroundColor: "rgba(255,99,132,0.2)",
                borderColor: "rgba(255,99,132,1)",
                borderWidth: 2,
                hoverBackgroundColor: "rgba(255,99,132,0.4)",
                hoverBorderColor: "rgba(255,99,132,1)",
                data: [65, 59, 20, 81, 56, 55, 40],
            }]
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

        Chart.Line('chart', {
            options: options,
            data: data
        });
    }
}