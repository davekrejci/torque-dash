/* eslint-disable */
let shareModule = {
    shareId: null,
    init: async function() {
        try{
            this.shareId = await this.getShareId();
            this.cacheDOM();
            this.bindEvents();
            this.render();
        }
        catch(err) {
            console.log(err);
        }
    },
    cacheDOM: function() {
        this.$loadOverlay = $('#loadOverlay').hide();
        this.$switch = $('#switch');
        this.$shareMessage = $('#shareMessage');
    },
    bindEvents: function() {
        $(document).ajaxStart( this.showLoadOverlay.bind(this) );
        $(document).ajaxStop( this.hideLoadOverlay.bind(this) );
        this.$switch.on("click", this.switch.bind(this) );
    },
    switch: async function() {
        try{
            await this.toggleShare();
            this.shareId = await this.getShareId();
            this.render();
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
    getShareId: function() {
        return $.get(`/api/users/shareid`);
    },
    toggleShare: function() {
        return $.ajax({
            type: 'PATCH',
            url: `/api/users/shareid`
        });
    },
    showLoadOverlay: function() {
        this.$loadOverlay.show();
    },
    hideLoadOverlay: function() {
        this.$loadOverlay.hide();
    },
    render: function() {
        if(!this.shareId) {
            this.$switch.prop('checked', false);
            this.$shareMessage.text('Your account is not being shared.');
        }
        else {
            this.$switch.prop('checked', true);
            let origin = window.location.origin;
            let link = `${origin}/shareview/${this.shareId}`;
            this.$shareMessage.html(`Your sessions are now publicly viewable at <a href="${link}">${link}</a>.`);
        }
    }
    
}

shareModule.init(); 

/* eslint-disable */
let forwardModule = {
    forwardUrls: null,
    init: async function() {
        try{
            this.forwardUrls = new Set(await this.getForwardUrls());
            this.cacheDOM();
            this.bindEvents();
            this.render();
        }
        catch(err) {
            console.log(err);
        }
    },
    cacheDOM: function() {
        this.$forwardInput = $('#forwardInput');
        this.$forwardForm = $('#forwardForm');
        this.$forwardList = $('#forwardList');
    },
    bindEvents: function() {
        this.$forwardForm.on('submit', this.addToForwardList.bind(this) );
    },
    addToForwardList: async function(event) {
        event.preventDefault();
        try{
            let url = this.$forwardInput.val()
            this.forwardUrls.add(url);
            await this.updateForwardList();
            this.render();
            this.$forwardInput.val('');
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
    updateForwardList: async function() {
        return $.ajax({
            type: 'PUT',
            url: `/api/users/forwardurls`,
            data : { urls: [...this.forwardUrls] }
        });
    },
    removeURL: async function (remove) {
        try{
            this.forwardUrls = new Set([...this.forwardUrls].filter(url => url !== remove));
            await this.updateForwardList();
        }
        catch (err) {
            console.log(err);
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.'
            });
        }
        this.render();

    },
    getForwardUrls: function() {
        return $.get(`/api/users/forwardurls`);
    },
    render: function() {
        this.$forwardList.html('');
        this.forwardUrls.forEach(url => {
            this.$forwardList.append(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <a href='${url}'>${url}</a>
                    <span class="deleteURL text-primary ml-1" onclick="forwardModule.removeURL('${url}')"><i class="fas fa-times"></i></span>                            
                </li>
            `);
        });
    }
    
}

forwardModule.init(); 







