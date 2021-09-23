"use strict";

const ArrayManager = require("../managers/ArrayManager");
const UserOnLeaderboard = require("../foundation/UserOnLeaderboard");

/**
 * @description A list of UserOnLeaderboard objects put together to form a leaderboard
 * @extends {Array<UserOnLeaderboard>}
 */

class Leaderboard extends ArrayManager {

    // THESE ARE FOR DOCUMENTATION PURPOSES (@see ../managers/ArrayManager)

    /**
     * @param {number} amount the amount to return 
     * @returns {UserOnLeaderboard[]}
     */

    first(amount=1) {
        return amount < 0
        ? this.last(-amount)
        : this.slice(0, amount);
    }

    /**
     * @param {number} amount the amount to return 
     * @returns {UserOnLeaderboard[]}
     */

    last(amount=1) {
        return amount < 0
        ? this.first(-amount)
        : this.slice(-amount);
    }

    /**
     * @param {number} indexInitial the starting index 
     * @param {number} amount the amount to return 
     * @returns {UserOnLeaderboard[]}
     */

    section(indexInitial=0, amount=this.length) {
        return this.slice(indexInitial, indexInitial + amount);
    }

    /**
     * @param {number} index the 0-based page
     * @param {number} amount the amount to return 
     * @returns {UserOnLeaderboard[]}
     */

    page(index=0, perPage=this.length) {
        return this.section(index * perPage, perPage);
    }

    /**
     * @returns {UserOnLeaderboard}
     */

    random() {
        return this[Math.floor(Math.random() * this.length)];
    }

}

module.exports = Leaderboard;