"use strict";

/**
 * @description Extension for functions
 */

class Callback {

    /**
     * @constructor
     * @param {Function} callback The function to be used
     * @param {?() => boolean} condition The condition to be met in order for the function to be used
     */

    constructor(callback, condition=null) {

        if (typeof callback !== "function")
            throw new Error("Callback must be a function");

        /**
         * @description The timestamp the callback was last ran
         * @type {Function}
         */

        this.callback = callback;

        /**
         * @description The condition to be met in order for the function to be used
         * @type {?Function}
         */

        this.condition = condition;

        /**
         * @description The timestamp the callback was last ran
         * @type {?Date}
         */

        this.lastRan = null;

        /**
         * @description The timestamp the callback last finished
         * @type {?Date}
         */

        this.lastCompleted = null;

        /**
         * @description The amount of times the callback has been ran
         * @type {number}
         */

        this.runCount = 0;

        /**
         * @description The amount of times the callback has been completed
         * @type {number}
         */

        this.completedCount = 0;

    }
    
    /**
     * @description Whether the callback function has been used at least once
     * @type {boolean}
     */

    hasRan() { return this.runCount != 0; }
    
    /**
     * @description Whether the callback includes a condition
     * @type {boolean}
     */

    hasCondition() { return typeof this.condition === "function"; }
    
    /**
     * @description Whether the callback meets the condition
     * @type {boolean}
     */

    canRun() { return !this.hasCondition() || this.condition() === true; }
    
    /**
     * @description Runs the callback
     * @returns {Promise}
     */

    async run(...args) {
        this.runCount++;
        this.lastRan = new Date();
        return await Promise.all([this.callback(...args)]).then(() => {
            this.lastCompleted = new Date();
            this.completedCount++;
        });
    }
    
    /**
     * @description Runs the callback if the condition is met
     * @returns {boolean} Whether the callback was ran
     */

    async runConditioned(...args) {
        if (this.canRun()) {
            await this.run(...args);
            return true;
        }
        return false;
    }

}

module.exports = Callback;
