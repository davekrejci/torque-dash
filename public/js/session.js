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
}