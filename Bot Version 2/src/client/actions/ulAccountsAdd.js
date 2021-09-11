"use strict";

const Action = require("./Action");
const UserProfile = require("../../lib/ul/source/foundation/UserProfile");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Adds an account to the ulAccounts cache
 * @extends {Action}
 */

class ulAccountsAddAction extends Action {

    /**
     * @param {UserProfile} entry
     */

    handle(entry) {
        if (!this.client.ulAccounts.add(entry)) return;
        this.client.emit(events.UL_ACCOUNTS_ADD, entry);
    }

}

module.exports = ulAccountsAddAction;