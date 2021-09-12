"use strict";

const Action = require("./Action");
const UserOnLeaderboard = require("../../foundation/UserOnLeaderboard");

/**
 * @description Updates an account on the gdAccounts cache
 * @extends {Action}
 */

class ulLeaderboardUpdateAction extends Action {

    /**
     * @param {UserOnLeaderboard} entry
     */

    handle(entry) {
        if (!(entry instanceof UserOnLeaderboard)) return;
        this.client.actions.ulLeaderboardDelete.handle(entry);
        this.client.actions.ulLeaderboardAdd.handle(entry);
    }

}

module.exports = ulLeaderboardUpdateAction;