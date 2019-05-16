/* eslint-disable */
let overviewModule = {

    init: async function() {
        this.cacheDOM();
        this.bindEvents();
        this.initLogTable();
    },
    cacheDOM: function() {
        this.$loadOverlay = $('#loadOverlay').hide();
        this.$logTable = $('#logTable');
    },
    bindEvents: function() {
        $(document).ajaxStart( this.showLoadOverlay.bind(this) );
        $(document).ajaxStop( this.hideLoadOverlay.bind(this) );
        $('#deleteSessionModal').on('show.bs.modal', function (event) {
            let button = $(event.relatedTarget) // Button that triggered the modal
            let id = button.data('id') // Extract info from data-* attributes
            let modal = $(this)
            modal.find('.modal-footer #modalDeleteButton').attr("onclick", "overviewModule.deleteSession('"+id+"')");
        });
    },
    initLogTable: async function() {
        this.$logTable.DataTable({
            "dom": '<f<t><"my-3"i><"my-3"p>>',
            "bLengthChange": false,
            "pageLength": 5,
            responsive: true,
            ajax: {
                url: '/api/sessions',
                dataSrc: function (json) {
                    var return_data = new Array();
                    for(var i=0;i< json.length; i++){
                      return_data.push({
                        'name': json[i].name,
                        'startDate': moment(json[i].startDate).format('DD.MM.YYYY HH:mm:ss'),
                        'endDate': moment(json[i].endDate).format('DD.MM.YYYY HH:mm:ss'),
                        'duration': json[i].duration,
                        'startLocation': json[i].startLocation,
                        'endLocation': json[i].endLocation
                      })
                    }
                    return return_data;
                  }
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
                        return `
                        <div class="dropdown">
                        <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-wrench"></i>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                          <a class="dropdown-item" href="/edit/${data.id}"><i class="fas fa-pen mr-2"></i>Edit</a>
                          <button class="dropdown-item" data-toggle="modal" data-target="#deleteSessionModal" data-id="${data.id}"><i class="fas fa-trash mr-2"></i>Delete</button>
                          <button class="dropdown-item" onclick="overviewModule.exportCSV(${data.id})" data-id="${data.id}"><i class="fas fa-download mr-2"></i>Export CSV</button>
                        </div>
                      </div>
                        `
                    }
            }],
            order: [ 1, "desc" ],
        });
    },
    showLoadOverlay: function() {
        this.$loadOverlay.show();
    },
    hideLoadOverlay: function() {
        this.$loadOverlay.hide();
    },
    deleteSession: async function(id) {
        try{
            await Session.deleteSession(id);
            this.$logTable.DataTable().ajax.reload();
        }
        catch(err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            });
        }
    },
    exportCSV: async function(id) {
        try{
            // Get session
            let session = await Session.getSession(id);
            let exportedFileName = session.name;
            // Create list of all columns
            let columns = ['timestamp','lon','lat'];
            let allValues = new Array;
            session.Logs.forEach(log => {
                allValues.push(Object.keys(log.values));
            });
            let valueSet = [...new Set([].concat(...allValues))];
            valueSet.forEach(value => {
                columns.push(`values.${value}`);
            });
            // Parse json to csv
            const json2csvParser = new json2csv.Parser({  defaultValue: '-', fields: columns });
            const csv = json2csvParser.parse(session.Logs);
            // Download csv
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var link = document.createElement("a");
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${exportedFileName}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        catch (err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            });
        }
    }
}

overviewModule.init();
    
    
    






