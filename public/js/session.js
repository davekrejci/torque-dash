/* eslint-disable */

// Class for dealing with session api calls
class Session {
    /**
     * Method for getting all sessions
     * @returns Promise
     */
    static getSessions() {
        return $.get('/api/sessions');
    }

    /**
     * Method for getting single session by id
     * @param {*} id 
     * @returns Promise
     */
    static getSession(id) {
        return $.get(`/api/sessions/${id}`);
    }

    /**
     * Method for deleting session
     * @param {*} id 
     */
    static deleteSession(id) {
        return $.ajax({
                type: 'DELETE',
                url: `/api/sessions/${id}`,
            });
    }
    static renameSession(id, name) {
        return $.ajax({
                type: 'PATCH',
                url: `/api/sessions/rename/${id}`,
                data : {name: name}
            });
    }
    static copySession(id, name) {
        return $.ajax({
                type: 'POST',
                url: `/api/sessions/copy/${id}`,
                data : {name: name}
            });
    }
    static addLocations(id, locations) {
        return $.ajax({
                type: 'PATCH',
                url: `/api/sessions/addlocation/${id}`,
                data : {locations: locations}
            });
    }
}