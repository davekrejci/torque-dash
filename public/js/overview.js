/* eslint-disable */


// let OverviewModule = {
//     init: function() {
//         this.cacheDOM();
//         this.bindEvents();
//         this.session = await Session.getSession(this.sessionId);
//     },
//     cacheDOM: function() {
//         this.$logTable = $('#logTable');
//         this.$renameButton = $('#renameButton');
//     },
//     bindEvents: function() {
//         this.$renameButton.on("click", displayRenameModal )
//     },
//     displayRenameModal: function() {
        
//     }

// }

// On page load
$(document).ready(function () {
    // Initialize datatable
    $('#logTable').DataTable({
        "dom": '<f<t><"my-3"i><"my-3"p>>',
        "bLengthChange": false,
        "pageLength": 5,
        responsive: true
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
            Swal.fire({
                type: 'success',
                title: 'Success!',
                text: 'Locations added!'
            });
        })
        .fail(function (err) {
            // Show alert message
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            });
        });
}





