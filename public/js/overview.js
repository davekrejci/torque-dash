/* eslint-disable */

// On page load
$(document).ready(function () {
    // Initialize datatable
    $('#logTable').DataTable({
        "dom": '<f<t><"my-3"i><"my-3"p>>',
        "bLengthChange": false,
        "pageLength": 5,
        responsive: true
    });
    // Enable sidebar toggling
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
    // Enable tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })
});





