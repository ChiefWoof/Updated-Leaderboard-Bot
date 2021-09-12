"use strict";

const Action = require("./Action");
const UserOnLeaderboard = require("../../foundation/UserOnLeaderboard");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Adds an entry to the ulLeaderboard cache
 * @extends {Action}
 */

class ulLeaderboardAddAction extends Action {

    /**
     * @param {UserOnLeaderboard} entry
     */

    handle(entry) {
        if (!this.client.ulLeaderboard.add(entry)) return;
        this.client.emit(events.UL_LEADERBOARD_ADD, entry);
    }

}

module.exports = ulLeaderboardAddAction;