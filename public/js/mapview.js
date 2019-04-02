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