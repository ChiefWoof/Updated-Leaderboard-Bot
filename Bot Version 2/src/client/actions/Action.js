"use strict";

class Action {
    
    constructor(client) {

        Object.defineProperty(this, "client", { writable: true });        
        this.client = client;

    }

    /**
     * @description The handler of the action
     */

    handle() { return null; }

}

module.exports = Action;