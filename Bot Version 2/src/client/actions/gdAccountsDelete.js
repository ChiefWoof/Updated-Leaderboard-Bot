"use strict";

const Action = require("./Action");
const UserInfo = require("../../lib/geometrydashAPI/source/foundation/UserInfo");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Deletes an account from the gdAccounts cache
 * @extends {Action}
 */

class gdAccountsDeleteAction extends Action {

    /**
     * @param {UserInfo} entry
     */

    handle(entry) {
        if (!entry) return;
        if (this.client.gdAccounts.hasRank(entry.accountID)) {
            let v = this.client.gdAccounts.get(`${entry.accountID}`);
            this.client.gdAccounts.delete(entry.accountID);
            this.client.emit(events.GD_ACCOUNTS_DELETE, v);
        }
    }

}

module.exports = gdAccountsDeleteAction;