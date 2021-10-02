"use strict";

const CacheManager = require("./CacheManager");
const Callback = require("../foundation/Callback");

/**
 * @description A collection of stored callback functions
 * @extends {Map<string, () => boolean>}
 */

class CallbackManager extends CacheManager {

    /**
     * @description Attempts to run an refresh id
     * @param {string} id 
     * @returns {boolean} Whether it was successfully ran
     */

    run(id, ...args) { return this.has(`${id}`) && this.get(`${id}`)(...args); }
    
    /**
     * @description Attempts to register entries in an object into the cache
     * @param {string} id 
     * @param {string} prefix 
     * @returns {Object<string, () => boolean>} Which entries were addd
     */

    addObject(obj) {
        Object.entries(obj).reduce((v, [aK, aV]) => {
            v[aK] = this.add(aK, aV);
            return v;
        }, {});
    }
    
    /**
     * @description Attempts to register data into the cache by a stringified identification number
     * @param {string} id 
     * @param {*} data 
     * @returns {boolean} Whether the entry was added
     */

    add(id, data) {
        return super.add(id, data instanceof Callback ? data : new Callback(data));
    }
    
    /**
     * @description Attempts to update a entry's data
     * @param {string} id 
     * @param {*} data 
     * @returns {boolean} Whether the entry was updated
     */

    update(id, data) {
        return super.update(id, data instanceof Callback ? data : new Callback(data));
    }

}

module.exports = CallbackManager;
