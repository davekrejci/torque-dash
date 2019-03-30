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

// ------------------- DELETE MODAL -------------------- //

$('#deleteSessionModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget); // Button that triggered the modal
    let id = button.data('id'); // Extract info from data-* attributes
    let modal = $(this);
    modal.find('.modal-footer #modalDeleteButton').attr("onclick", "deleteSession('" + id + "')");
});

function deleteSession(id) {
    $('#deleteSessionModal').modal('hide');
    $.ajax({
            type: 'DELETE',
            url: `/customers/${id}`,
        })
        .done(function (response) {
            window.location.reload();
        })
        .fail(function (err) {
            // Show alert message
            console.log(err);
        });
}

