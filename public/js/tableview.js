/* eslint-disable */

// ------------------- SIDEBAR TOGGLE -------------------- //

$(document).ready(async function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    $('#logTable').DataTable({
        "lengthMenu": [5],
        "pageLength": 5
    });
});

// async function fetch(url) {
//     let logs = await $.ajax({
//             type: 'GET',
//             dataType: "json",
//             url: url,
//         })
//         .done(function (res) {
//             return res;
//         })
//         .fail(function (err) {
//             console.log(err);
//         });
//     return logs;
// }
// function toggleUpdates() {
//     setInterval(async function () {
//         let logs = await fetch('http://localhost:3000/logs');
//         updateTable(logs);
//     }, 1000);
// }
// function updateTable(logs){
//     var tbody = $("#data");
//     tbody.html("");
//     for (let log in logs) {
//         var tr = $("<tr></tr>");
//         tr.append("<td>" + logs[log].eml + "</td>" +
//             "<td>" + logs[log].v + "</td>" +
//             "<td>" + logs[log].session + "</td>" +
//             "<td>" + logs[log].t_id + "</td>");
//         tbody.append(tr)
//     }
// }