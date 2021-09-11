"use strict";

const Action = require("./Action");
const UserInfo = require("../../lib/geometrydashAPI/source/foundation/UserInfo");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Adds an account to the gdAccounts cache
 * @extends {Action}
 */

class gdAccountsAddAction extends Action {

    /**
     * @param {UserInfo} entry
     */

    handle(entry) {
        if (!this.client.gdAccounts.add(entry)) return;
        this.client.emit(events.GD_ACCOUNTS_ADD, entry);
    }

}

module.exports = gdAccountsAddAction;