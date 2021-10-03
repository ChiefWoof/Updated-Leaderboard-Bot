"use strict";

const CacheManager = require("./CacheManager");

/**
 * @description A collection of stored Discord text command callers
 * in the format (caller, commandID)
 * @extends {Map<string, string>}
 */

class CommandCallersManager extends CacheManager {

    /**
     * @returns {string[]} An array of callers
     */

    get callers() { return [...this.keys()]; }

    /**
     * @returns {RegExp[]} An array of callers as RegExp for ChatCommands
     */

    get callersRegexDiscord() { return [...this.keys()].map(a => new RegExp(`^(${a})`, "i")); }

    /**
     * @param {number} id The CommandID to look for
     * @returns {number} -1 or the accountID found
     */

    findIndexByCommandID(id) { return [...this.keys()].find(k => `${this.get(k)}` === `${id}`); }

    /**
     * @param {number} id The CommandID to look for
     * @returns {boolean} Whether a commandID exists in the cache
     */

    hasCommandID(id) { return this.findIndexByCommandID(id) !== undefined; }

    /**
     * @param {string} caller The caller to look for
     * @returns {boolean} Whether an accountID exists in the cache
     */

    hasCaller(caller) { return this.has(`${caller}`); }
    
    /**
     * @description Attempts to register an entry into the cache
     * @param {string} id 
     * @param {string} caller 
     * @returns {boolean} Whether the entry was added
     */

    add(caller, commandID) {
        if (!["string", "number", "bigint"].includes(typeof commandID) || !/^[0-9]$/.test(commandID))
            throw new Error("commandID is not a proper positive integer");
        if (typeof caller !== "string" || !caller)
            throw new Error("caller must contain characters");
        if (!this.hasCaller(caller)) {
            this.set(caller, `${commandID}`);
            return true;
        }
        return false;
    }
    
    /**
     * @description Attempts to register entries in an object into the cache
     * @param {Object<string, number|string|BigInt>>} obj
     * @returns {Object<string, boolean>} Which entries were addd
     */

    addObject(obj) {
        Object.entries(obj).reduce((v, [aK, aV]) => {
            v[aK] = this.add(aK, aV);
            return v;
        }, {});
    }
    
    /**
     * @description Attempts to update a entry's data
     * @param {string} caller 
     * @param {number|string|BigInt} commandID 
     * @returns {boolean} Whether the entry was updated
     */

    update(caller, commandID) {
        if (!["string", "number", "bigint"].includes(typeof commandID) || !/^[0-9]$/.test(commandID))
            throw new Error("commandID is not a proper positive integer");
        if (typeof caller !== "string" || !caller)
            throw new Error("caller must contain characters");
        if (this.hasCaller(caller)) {
            this.set(caller, `${commandID}`);
            return true;
        }
        return false;
    }

    /**
     * @description Attempts to remove a registered entry
     * @param {string|number} index the index to be removed
     * @returns Whether the entry was removed
     * @override
     */

    delete(index) {
        if (this.hasIndex(index)) {
            super.delete(`${index}`);
            return true;
        }
        return false;
    }

    /**
     * @description Attempts to remove a registered entry by the entry object
     * @param {string} commandID the commandID
     * @returns {boolean} Whether the entry was removed
     * @override
     */

    deleteCommadID(commandID) { return this.delete(this.findIndexByCommandID(commandID)); }

}

module.exports = CommandCallersManager;