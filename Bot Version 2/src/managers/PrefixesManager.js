"use strict";

const CacheManager = require("./CacheManager");

/**
 * @description A collection of stored Discord text prefixes
 * in the format (id, prefix)
 * @extends {Map<string, string>}
 */

class PrefixesManager extends CacheManager {

    /**
     * @returns {string[]} An array of prefixes
     */

    get prefixes() { return [...this.values()]; }

    /**
     * @returns {RegExp[]} An array of prefixes as RegExp for ChatCommands
     */

    get prefixesRegexDiscord() { return [...this.values()].map(a => new RegExp(`^(${a})`, "i")); }

    /**
     * @param {string} prefix the prefix to look for
     * @returns {number} -1 or the found index
     */

    findIndexByPrefix(prefix) { return [...this.keys()].find(k => `${this.get(k)}` === `${prefix}`); }

    /**
     * @param {string} prefix the prefix to look for
     * @returns {boolean} Whether a prefix exists in the cache
     */

    hasPrefix(prefix) { return this.findIndexByPrefix(prefix) !== undefined; }

    /**
     * @param {string} index the index to look for
     * @returns {boolean} Whether the index exists in the cache
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
     * @param {Object<number, string>>} obj
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
     * @param {string} prefix the prefix
     * @returns {boolean} Whether the entry was removed
     * @override
     */

    deletePrefix(prefix) { return this.delete(this.findIndexByPrefix(prefix)); }

}

module.exports = PrefixesManager;
