/* eslint-disable */

async function fetch(url) {
    let logs = await $.ajax({
            type: 'GET',
            dataType: "json",
            url: url,
        })
        .done(function (res) {
            return res;
        })
        .fail(function (err) {
            console.log(err);
        });
    return logs;
}
$(document).ready(function () {
    setInterval(async function () {
        let logs = await fetch('http://localhost:3000/logs');
        console.log(logs);
        var tbody = $("#data");
        tbody.html("");
        for (let log in logs) {
            var tr = $("<tr></tr>");
            tr.append("<td>" + logs[log].eml + "</td>" +
                "<td>" + logs[log].v + "</td>" +
                "<td>" + logs[log].session + "</td>" +
                "<td>" + logs[log].t_id + "</td>");
            tbody.append(tr)
        }

    }, 1000);
});