/* eslint-disable */

// On page load
$(document).ready(function () {
    // Initialize datatable
    $('#logTable').DataTable({
        "dom": '<f<t><"my-3"i><"my-3"p>>',
        "bLengthChange": false,
        "pageLength": 5,
        responsive: true,
        ajax: {
            url: '/api/sessions',
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
                // puts buttons in the last column
                targets: [-1], render: function (data, type, row, meta) {
                    return `<a data-toggle="tooltip" data-placement="top" title="Edit" class="btn btn-primary table-button rounded primary-tooltip" href="/edit/${data.id}"><i class="fas fa-pen"></i></a>
                    <span data-toggle="tooltip" data-placement="top" title="Delete">
                    <button class="btn btn-primary table-button rounded primary-tooltip" data-toggle="modal" data-target="#deleteSessionModal"
                        data-id="${data.id}"><i class="fas fa-trash"></i></button>
                    </span>`
                }
        }],
        order: [ 1, "desc" ],
    });
});

    
    
    






