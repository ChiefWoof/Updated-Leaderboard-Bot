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
        if (this.client.ulAccounts.hasULID(entry.ulID)) {
            let v = this.client.ulAccounts.get(`${entry.ulID}`);
            this.client.ulAccounts.delete(entry.ulID);
            this.client.emit(events.UL_ACCOUNTS_DELETE, v);
        }
    }

}

module.exports = ulAccountsDeleteAction;