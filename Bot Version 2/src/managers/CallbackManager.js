"use strict";

const CacheManager = require("./CacheManager");

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

    run(id) { return this.has(`${id}`) && this.get(`${id}`)(); }
    
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

}

module.exports = CallbackManager;