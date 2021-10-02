"use strict";

/**
 * @description Storage for stats on the bot for quick and easy lookup
 */

class ClientStatistics {
    
    constructor(client) {

        Object.defineProperty(this, "client", { writable: true });        
        this.client = client;

    }

    /**
     * @description The handler for the stats
     */

    async handle() {}

}

module.exports = ClientStatistics;