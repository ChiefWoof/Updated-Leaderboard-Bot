"use strict";

const Action = require("./Action");
const UserProfile = require("../../lib/ul/source/foundation/UserProfile");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Deletes an account from the ulAccounts cache
 * @extends {Action}
 */

class ulAccountsDeleteAction extends Action {

    /**
     * @param {UserProfile} entry
     */

    handle(entry) {
        if (!entry) return;
        if (this.client.ulAccounts.deleteEntry(entry))
            this.client.emit(events.UL_ACCOUNTS_DELETE, entry);
    }

}

module.exports = ulAccountsDeleteAction;
