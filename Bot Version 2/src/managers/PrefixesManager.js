"use strict";

const CacheManager = require("./CacheManager");
const UserInfo = require("../lib/geometrydashAPI/source/foundation/UserInfo");

/**
 * @description A collection of stored Discord text prefixes
 * in the format (id, prefix)
 * @extends {Map<string, string>}
 */

class PrefixesManager extends CacheManager {

    /**
     * @param {number} id the playerID to look for
     * @returns {number} -1 or the accountID found
     */

    findIndexByPrefix(prefix) { return [...this.keys()].find(k => `${this.get(k)}` === `${prefix}`); }

    /**
     * @returns {boolean} Whether a playerID exists in the cache
     */

    hasPrefix(id) { return this.findIndexByPrefix(id) !== undefined; }

    /**
     * @returns {boolean} Whether an accountID exists in the cache
     */

    hasIndex(id) { return this.has(`${id}`); }
    
    /**
     * @description Attempts to register an entry into the cache
     * @param {string} id 
     * @param {string} prefix 
     * @returns {boolean} Whether the entry was added
     */

    add(id, prefix) {
        if (typeof id !== "string" || !/^[0-9]$/.test(id))
            throw new Error("id is not a proper positive integer");
        if (typeof prefix !== "string" || !prefix)
            throw new Error("prefix must contain characters");
        if (!this.hasPrefix(prefix)) {
            this.set(`${id}`, prefix);
            return true;
        }
        return false;
    }
    
    /**
     * @description Attempts to register entries in an object into the cache
     * @param {string} id 
     * @param {string} prefix 
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
     * @param {string} id 
     * @param {string} prefix 
     * @returns {boolean} Whether the entry was updated
     */

    update(id, prefix) {
        if (typeof id !== "string" || !/^[0-9]$/.test(id))
            throw new Error("id is not a proper positive integer");
        if (typeof prefix !== "string" || !prefix)
            throw new Error("prefix must contain characters");
        if (this.hasPrefix(prefix)) {
            this.set(`${id}`, prefix);
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
     * @param {UserInfo} prefix the prefix
     * @returns {boolean} Whether the entry was removed
     * @override
     */

    deletePrefix(prefix) { return this.delete(this.findIndexByPrefix(prefix)); }

}

module.exports = PrefixesManager;