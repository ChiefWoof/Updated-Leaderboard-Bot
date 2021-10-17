"use strict";

const GoogleSpreadsheetRow = require("../../../../../googlesheetsExtended/src/foundation/GoogleSpreadsheetRow");

const Region = require("../../../../../earth/src/foundation/Region");
const Country = require("../../../../../earth/src/foundation/Country");
const Province = require("../../../../../earth/src/foundation/Province");

const ColorSearch = require("./ColorSearch");
const Color = require("../../../../src/util/Color");

const UserStatsBans = require("../util/UserStatsBans");
const IconSet = require("../util/IconSet");

/**
 * @description An extended version of the "GoogleSpreadsheetRow" extension
 * to fit the UL Googlesheet's "Data" tab
 */

class GoogleSpreadsheetRow_Database extends GoogleSpreadsheetRow {
    static NULL_VALUE = GoogleSpreadsheetRow_Database.NULL_VALUE;

    /**
     * @description The timestamp the user was added to the database
     * @returns {?Date}
     * @param {Date} timestamp
     */

    get timestampJoined() {
        let cell = this.getCellByHeader("timestamp");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;

        if (!(cell && cellValue)) return null;
        switch (typeof cellValue) {

            default: { return null; }

            case "number": {
                let value = new Date(cellValue * 24 * 60 * 60 * 1000);
                value.setFullYear(value.getFullYear() - 71);
                value.setHours(value.getHours() + 6);
                return value;
            }

            case "string": {
                let value = cellValue.split("*")[0];
                value = new Date(value);
                return isNaN(value.getTime()) ? null : value;
            }

        }
    }
    
    set timestampJoined(timestamp) {
        let cell = this.getCellByHeader("timestamp");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        if (cell) {
            let date = new Date(timestamp);
            let value = cellValue ? cellValue.split("*") : [];
            value[0] = isNaN(date.getTime()) ? "" : `${date.getTime()}`;
            cell.value = value.join("*");
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The Discord ID of the helper that aded the user to the database
     * or 0n
     * @returns {BigInt}
     */

    get addedBy() {
        let cell = this.getCellByHeader("timestamp");
        if (!cell) return 0n;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let value = typeof cellValue === "string" ? cellValue.split("*")[1] : 0n;
        return value ? BigInt(value || 0) : 0n;
    }
    
    set addedBy(id) {
        let cell = this.getCellByHeader("timestamp");
        if (id == null) id = 0n;
        if (cell && ["string", "number", "bigint"].includes(typeof id) && /^[0-9]{1,}$/.test(id)) {
            let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
            let value = cellValue ? cellValue.split("*") : [];
            value[1] = id;
            cell.value = value.join("*");
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD accountID of the user or 0n
     * @returns {BigInt}
     * @param {BigInt} id
     */

    get accountID() {
        let cell = this.getCellByHeader("accountID");
        if (!cell) return 0n;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && /^[0-9]{1,}$/.test(cellValue)
        ? BigInt(cellValue)
        : 0n;
    }
    
    set accountID(id) {
        let cell = this.getCellByHeader("accountID");
        if (cell && ["number", "string", "bigint"].includes(typeof id) && /^[0-9]{1,}$/.test(id)) {
            cell.value = `${id}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description Whether the user is a member of Star Grinders
     * @returns {boolean}
     * @param {boolean} value
     */

    get sg() {
        let cell = this.getCellByHeader("sg");
        return cell
        ? /^true$/i.test(cell._draftData.value === undefined ? cell.value : cell._draftData.value)
        : false;
    }
    
    set sg(value) {
        let cell = this.getCellByHeader("sg");
        if (cell) {
            cell.value = `${/^true$/i.test(value)}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description Whether the user is banned from the Updated Leaderboard
     * @returns {boolean}
     * @param {boolean} value
     */

    get banned() {
        let cell = this.getCellByHeader("locked");
        return cell
        ? /^true$/i.test(cell._draftData.value === undefined ? cell.value : cell._draftData.value)
        : false;
    }
    
    set banned(value) {
        let cell = this.getCellByHeader("locked");
        if (cell) {
            cell.value = `${/^true$/i.test(value)}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description Whether the user is banned from being able to update their Updated Leaderboard settings
     * @returns {boolean}
     * @param {boolean} value
     */

    get bannedSettings() {
        let cell = this.getCellByHeader("setBan");
        return cell
        ? /^true$/i.test(cell._draftData.value === undefined ? cell.value : cell._draftData.value)
        : false;
    }
    
    set bannedSettings(value) {
        let cell = this.getCellByHeader("setBan");
        if (cell) {
            cell.value = `${/^true$/i.test(value)}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description What specific stat leaderboards that user is banned from
     * @returns {UserStatsBans}
     * @param {UserStatsBans} value
     */

    get bannedLeaderboards() {
        let cell = this.getCellByHeader("banFrom");
        return new UserStatsBans(cell ? cell._draftData.value === undefined ? cell.value : cell._draftData.value : undefined);
    }
    
    set bannedLeaderboards(value) {
        let cell = this.getCellByHeader("banFrom");
        let v = value instanceof UserStatsBans ? value : new UserStatsBans(value);
        if (cell) {
            cell.value = `${v.bansString || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD accountID of the user or 0n
     * @returns {BigInt}
     * @param {BigInt} id
     */

    get playerID() {
        let cell = this.getCellByHeader("playerID");
        if (!cell) return 0n;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && /^[0-9]{1,}$/.test(cellValue)
        ? BigInt(cellValue)
        : 0n;
    }
    
    set playerID(id) {
        let cell = this.getCellByHeader("playerID");
        if (cell && ["number", "string", "bigint"].includes(typeof id) && /^[0-9]{1,}$/.test(id)) {
            cell.value = `${id}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD username of the user or null
     * @returns {?string}
     * @param {?string} value
     */

    get username() {
        let cell = this.getCellByHeader("username");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE ? `${cellValue}` : null;
    }
    
    set username(value) {
        let cell = this.getCellByHeader("username");
        if (cell) {
            cell.value = `${value || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD star count of the user or 0
     * @returns {number}
     * @param {number|BigInt|string} value
     */

    get stars() {
        let cell = this.getCellByHeader("stars");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let v = Number(cellValue);
        return isNaN(v) ? 0 : v;
    }
    
    set stars(value) {
        let cell = this.getCellByHeader("stars");
        if (cell) {
            cell.value = `${value && /^[0-9]{1,}$/.test(value) ? value : 0}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD diamond count of the user or 0
     * @returns {number}
     * @param {number|BigInt|string} value
     */

    get diamonds() {
        let cell = this.getCellByHeader("diamonds");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let v = Number(cellValue);
        return isNaN(v) ? 0 : v;
    }
    
    set diamonds(value) {
        let cell = this.getCellByHeader("diamonds");
        if (cell) {
            cell.value = `${value && /^[0-9]{1,}$/.test(value) ? value : 0}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD secret coin count of the user or 0
     * @returns {number}
     * @param {number|BigInt|string} value
     */

    get scoins() {
        let cell = this.getCellByHeader("scoins");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let v = Number(cellValue);
        return isNaN(v) ? 0 : v;
    }
    
    set scoins(value) {
        let cell = this.getCellByHeader("scoins");
        if (cell) {
            cell.value = `${value && /^[0-9]{1,}$/.test(value) ? value : 0}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD user coin count of the user or 0
     * @returns {number}
     * @param {number|BigInt|string} value
     */

    get ucoins() {
        let cell = this.getCellByHeader("ucoins");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let v = Number(cellValue);
        return isNaN(v) ? 0 : v;
    }
    
    set ucoins(value) {
        let cell = this.getCellByHeader("ucoins");
        if (cell) {
            cell.value = `${value && /^[0-9]{1,}$/.test(value) ? value : 0}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD demon count of the user or 0
     * @returns {number}
     * @param {number|BigInt|string} value
     */

    get demons() {
        let cell = this.getCellByHeader("demons");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let v = Number(cellValue);
        return isNaN(v) ? 0 : v;
    }
    
    set demons(value) {
        let cell = this.getCellByHeader("demons");
        if (cell) {
            cell.value = `${value && /^[0-9]{1,}$/.test(value) ? value : 0}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The creator point count of the user or 0
     * @returns {number}
     * @param {number|BigInt|string} value
     */

    get cp() {
        let cell = this.getCellByHeader("cp");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let v = Number(cellValue);
        return isNaN(v) ? 0 : v;
    }
    
    set cp(value) {
        let cell = this.getCellByHeader("cp");
        if (cell) {
            cell.value = `${value && /^[0-9]{1,}$/.test(value) ? value : 0}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD mod status of the user or 0
     * @returns {number}
     * @param {number|BigInt|string} value
     */

    get mod() {
        let cell = this.getCellByHeader("mod");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let v = Number(cellValue);
        return isNaN(v) ? 0 : v;
    }

    /**
     * @description Whether the user is a GD elder mod
     * @returns {Boolean}
     */

    get isModElder() { return this.mod >= 2; }

    /**
     * @description Whether the user is a GD mod
     * @returns {Boolean}
     */

    get isMod() { return this.mod >= 1; }
    
    set mod(value) {
        let cell = this.getCellByHeader("mod");
        if (cell) {
            cell.value = `${value && /^[0-9]{1,}$/.test(value) ? value : 0}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The GD star-global rank of the user or 0
     * @returns {number}
     * @param {number|BigInt|string} value
     */

    get rankGlobal() {
        let cell = this.getCellByHeader("rankGlobal");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let v = Number(cellValue);
        return isNaN(v) ? 0 : v;
    }
    
    set rankGlobal(value) {
        let cell = this.getCellByHeader("rankGlobal");
        if (cell) {
            cell.value = `${value && /^[0-9]{1,}$/.test(value) ? value : 0}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's primary GD icon set
     * @returns {IconSet}
     * @param {IconSet} value
     */

    get iconSet() {
        let cell = this.getCellByHeader("iconData");
        return new IconSet(cell ? cell._draftData.value === undefined ? cell.value : cell._draftData.value : undefined);
    }
    
    set iconSet(value) {
        let cell = this.getCellByHeader("iconData");
        let v = value instanceof IconSet ? value : new IconSet(value);
        if (cell) {
            cell.value = `${v.stringfy() || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The past GD usernames of the user or an empty array
     * @returns {string[]}
     * @param {(string|number|bigint)[]|string|number|bigint} value
     */

    get usernamesPast() {
        let cell = this.getCellByHeader("pastUsernames");
        if (!cell) return [];
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        if (!(typeof cellValue === "string" && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE)) return [];
        return cellValue.split(",").map(a => a ? a.split(":")[0] : undefined);
    }
    
    set usernamesPast(names) {
        let cell = this.getCellByHeader("pastUsernames");
        if (!Array.isArray(names)) names = [names];
        if (cell && names.every(a => a === null || ["string", "number", "bigint"].includes(typeof a))) {
            let times = this.usernamesPastTimestamps;
            let data = [];
            for (let i = 0; i < Math.max(times.length, names.length); i++) {
                data.unshift([
                    i < names.length ? names[names.length-1-i] || "" : "",
                    times[times.length-1-i] instanceof Date && !isNaN(times[times.length-1-i].getTime())
                    ? times[times.length-1-i].getTime()
                    : times[times.length-1-i]
                ].join(":"));
            }
            cell.value = data.join(",");
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The (timestamps or null) for when past GD usernames were changed of the user or an empty array
     * @returns {Date[]}
     * @param {(Date|string|number|bigint)[]|Date|string|number|bigint} value
     */

    get usernamesPastTimestamps() {
        let cell = this.getCellByHeader("pastUsernames");
        if (!cell) return [];
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        if (!(typeof cellValue === "string")) return [];
        return cellValue.split(",").map(a => {
            a = a.split(":")[1];
            return a && !isNaN(Number(a)) ? new Date(Number(a)) : null
        });
    }
    
    set usernamesPastTimestamps(times) {
        let cell = this.getCellByHeader("pastUsernames");
        if (!Array.isArray(times)) times = [times];
        if (cell && times.every(a => a === null || a instanceof Date || ["string", "number", "bigint"].includes(typeof a))) {
            let names = this.usernamesPast;
            let data = [];
            for (let i = 0; i < Math.max(times.length, names.length); i++) {
                data.unshift([
                    i < names.length ? names[names.length-1-i] || "" : "",
                    i < times.length && times[times.length-1-i] !== null
                    && (times[times.length-1-i] instanceof Date ? !isNaN(times[times.length-1-i].getTime()) : true)
                        ? times[times.length-1-i] instanceof Date
                            ? times[times.length-1-i].getTime()
                            : times[times.length-1-i]
                    : ""
                ].join(":"));
            }
            cell.value = data.join(",");
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description Whether the entered username matches the current username, ignoring casing
     * @param {string|number|bigint} username 
     * @returns {boolean}
     */

    usernameEquals(username) {
        let names = [
            this.username,
            ["string", "number", "bigint"].includes(typeof username) ? `${username}` : null
        ];
        return names.every(a => typeof a === "string")
        ? names[0].toLowerCase() === names[1].toLowerCase()
        : false;
    }

    /**
     * @description Determines what updates should be made due to the entered username
     * @param {string|number|bigint} username 
     * @returns {boolean} Whether an update was made
     */

    usernameUpdate(username) {
        if (["string", "number", "bigint"].includes(typeof username)) {
            username = `${username}`;
            if (username !== this.username) {
                if (!this.usernameEquals(username)) {
                    this.usernamesPast = [username, ...this.usernamesPast];
                    this.usernamesPastTimestamps = [Date.now(), ...this.usernamesPastTimestamps.slice(1)];
                }
                this.username = username;
                return true;
            }
        }
        return false;
    }

    /**
     * @description The timestamp of the latest update to the user on the Googlesheet
     * @returns {?Date}
     * @param {Date|number|BigInt|string} value
     */

    get timestampRefreshedStats() {
        let cell = this.getCellByHeader("refreshPrevious");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let v = new Date(/^\d{1,}$/.test(cellValue) ? Number(cellValue) : cellValue);
        return isNaN(v.getTime()) ? null : v;
    }
    
    set timestampRefreshedStats(value) {
        let cell = this.getCellByHeader("refreshPrevious");
        let v = `${value instanceof Date ? value.getTime() : value}`;
        if (cell) cell.value = `${v && /^[0-9]{1,}$/.test(v) ? v : 0}`;
    }

    /**
     * @description The user's home region
     * @returns {Region}
     * @param {Region} value
     */

    get region() {
        let cell = this.getCellByHeader("region");
        return new Region(cell ? cell._draftData.value === undefined ? cell.value : cell._draftData.value : undefined);
    }
    
    set region(value) {
        let cell = this.getCellByHeader("region");
        let v = value instanceof Region ? value : new Region(value);
        if (cell) {
            cell.value = `${v.id}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's home country
     * @returns {Country}
     * @param {Country} value
     */

    get country() {
        let cell = this.getCellByHeader("country");
        return new Country(cell ? cell._draftData.value === undefined ? cell.value : cell._draftData.value : undefined);
    }
    
    set country(value) {
        let cell = this.getCellByHeader("country");
        let v = value instanceof Country ? value : new Country(value);
        if (cell) {
            cell.value = `${v.id}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's home province or state
     * @returns {Province}
     * @param {Province} value
     */

    get province() {
        let cell = this.getCellByHeader("state");
        return new Province(cell ? cell._draftData.value === undefined ? cell.value : cell._draftData.value : undefined);
    }
    
    set province(value) {
        let cell = this.getCellByHeader("state");
        let v = value instanceof Province ? value : new Province(value);
        if (cell) {
            cell.value = `${v.id}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description Whether the user is a mobile player
     * @returns {boolean}
     * @param {boolean} value
     */

    get mobile() {
        let cell = this.getCellByHeader("mobile");
        return cell
        ? /^true$/i.test(cell._draftData.value === undefined ? cell.value : cell._draftData.value)
        : false;
    }
    
    set mobile(value) {
        let cell = this.getCellByHeader("mobile");
        if (cell) {
            cell.value = `${/^true$/i.test(value)}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description Whether the user is a PC player
     * @returns {boolean}
     * @param {boolean} value
     */

    get pc() {
        let cell = this.getCellByHeader("pc");
        return cell
        ? /^true$/i.test(cell._draftData.value === undefined ? cell.value : cell._draftData.value)
        : false;
    }
    
    set pc(value) {
        let cell = this.getCellByHeader("pc");
        if (cell) {
            cell.value = `${/^true$/i.test(value)}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The Discord tag of the user or null
     * @returns {?string}
     */

    get discordTag() {
        let cell = this.getCellByHeader("discord");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let value = typeof cellValue === "string" ? cellValue.substr(0, cellValue.lastIndexOf("*")) : null;
        return value && value !== GoogleSpreadsheetRow_Database.NULL_VALUE ? value : null;
    }
    
    set discordTag(tag) {
        let cell = this.getCellByHeader("discord");
        if (tag == null) tag = "";
        if (cell) {
            let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
            let value = cellValue ? [cellValue.substr(0, cellValue.lastIndexOf("*")), cellValue.substr(cellValue.lastIndexOf("*") + 1)] : [];
            value[0] = tag;
            cell.value = value.join("*");
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The Discord ID of the user or 0n
     * @returns {BigInt}
     */

    get discordID() {
        let cell = this.getCellByHeader("discord");
        if (!cell) return 0n;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        let value = typeof cellValue === "string" ? cellValue.substr(cellValue.lastIndexOf("*") + 1) : 0n;
        return /^[0-9]{1,}$/.test(value) ? BigInt(value) : 0n;
    }
    
    set discordID(id) {
        let cell = this.getCellByHeader("discord");
        if (id == null) id = 0n;
        if (cell && ["string", "number", "bigint"].includes(typeof id) && /^[0-9]{1,}$/.test(id)) {
            let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
            let value = cellValue ? [cellValue.substr(0, cellValue.lastIndexOf("*")), cellValue.substr(cellValue.lastIndexOf("*") + 1)] : [];
            value[1] = id;
            cell.value = value.join("*");
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's UL bio
     * @returns {?string}
     * @param {?string} value
     */

    get bio() {
        let cell = this.getCellByHeader("bio");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE ? `${cellValue}` : null;
    }
    
    set bio(value) {
        let cell = this.getCellByHeader("bio");
        if (cell) {
            cell.value = `${value || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's YouTube as listed on GD
     * @returns {?string}
     * @param {?string} value
     */

    get youtube() {
        let cell = this.getCellByHeader("youtube");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE ? `${cellValue}` : null;
    }
    
    set youtube(value) {
        let cell = this.getCellByHeader("youtube");
        if (cell) {
            cell.value = `${value || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's Twitter as listed on GD
     * @returns {?string}
     * @param {?string} value
     */

    get twitter() {
        let cell = this.getCellByHeader("twitter");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE ? `${cellValue}` : null;
    }
    
    set twitter(value) {
        let cell = this.getCellByHeader("twitter");
        if (cell) {
            cell.value = `${value || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's Twitch as listed on GD
     * @returns {?string}
     * @param {?string} value
     */

    get twitch() {
        let cell = this.getCellByHeader("twitch");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE ? `${cellValue}` : null;
    }
    
    set twitch(value) {
        let cell = this.getCellByHeader("twitch");
        if (cell) {
            cell.value = `${value || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's Discord primary guild invite code
     * @returns {?string}
     * @param {?string} value
     */

    get discordGuildInviteCode() {
        let cell = this.getCellByHeader("server");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE ? `${cellValue}` : null;
    }
    
    set discordGuildInviteCode(value) {
        let cell = this.getCellByHeader("server");
        if (cell) {
            cell.value = `${value || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's primary GD icon set
     * @returns {Color}
     * @param {Color} value
     */

    get pcolor() {
        let cell = this.getCellByHeader("pcolor");
        let cellData = cell ? cell._draftData.value === undefined ? cell.value : cell._draftData.value : undefined;
        let res = ColorSearch.search(cellData);
        if (res) {
            res.color.defaultValue = null;
            return res.color;
        }
        return new Color(cellData, null);
    }
    
    set pcolor(value) {
        let cell = this.getCellByHeader("pcolor");
        let v = value instanceof Color ? value : new Color(value, null);
        if (cell) {
            let res = ColorSearch.search(v);
            cell.value = `${res ? res.name : v && v.value !== null ? `#${v.hex}` : GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The image link for the user's background progression chart
     * @returns {?string}
     * @param {?string} value
     */

    get bgprog() {
        let cell = this.getCellByHeader("bgprog");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE ? `${cellValue}` : null;
    }
    
    set bgprog(value) {
        let cell = this.getCellByHeader("bgprog");
        if (cell) {
            cell.value = `${value || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's github username
     * @returns {?string}
     * @param {?string} value
     */

    get github() {
        let cell = this.getCellByHeader("github");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE ? `${cellValue}` : null;
    }
    
    set github(value) {
        let cell = this.getCellByHeader("github");
        if (cell) {
            cell.value = `${value || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

    /**
     * @description The user's instagram username
     * @returns {?string}
     * @param {?string} value
     */

    get instagram() {
        let cell = this.getCellByHeader("instagram");
        if (!cell) return null;
        let cellValue = cell._draftData.value === undefined ? cell.value : cell._draftData.value;
        return cellValue && cellValue !== GoogleSpreadsheetRow_Database.NULL_VALUE ? `${cellValue}` : null;
    }
    
    set instagram(value) {
        let cell = this.getCellByHeader("instagram");
        if (cell) {
            cell.value = `${value || GoogleSpreadsheetRow_Database.NULL_VALUE}`;
            this.timestampRefreshedStats = new Date();
        }
    }

}

module.exports = GoogleSpreadsheetRow_Database;
