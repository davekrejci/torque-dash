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
    
    // Setup delete session modal data
    $('#deleteProductModal').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget); // Button that triggered the modal
        let id = button.data('id'); // Extract info from data-* attributes
        let modal = $(this);
        modal.find('.modal-footer #modalDeleteButton').attr("onclick", "deleteProduct('" + id + "')");
        modal.find('#productName').html(name);
    });
});

// ------------------- DELETE MODAL -------------------- //


function deleteProduct(id) {
    $('#deleteProductModal').modal('hide');
    // Session.deleteSession(id);
    $.ajax({
            type: 'DELETE',
            url: `/api/sessions/${id}`,
        })
        .done(function (response) {
            swal()
        })
        .fail(function (err) {
            // Show alert message
            console.log(err);
        });
}





