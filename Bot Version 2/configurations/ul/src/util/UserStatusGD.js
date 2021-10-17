"use strict";

const BitField = require("./BitField");

/**
 * @description The status of the Discord User on Geometry Dash
 * @extends {BitField}
 */

class UserStatusGD extends BitField {

    /**
     * @description Whether the user has an account
     * @type {boolean}
     * @param {boolean} bool
     */

    get ACCOUNT() { return this.has(this.indicators.ACCOUNT); }
    set ACCOUNT(bool) { return this.resolveBitBoolean(this.indicators.ACCOUNT, bool); }

    /**
     * @description Whether the user has been awarded creator points
     * @type {boolean}
     * @param {boolean} bool
     */

    get CP() { return this.has(this.indicators.CP); }
    set CP(bool) { return this.resolveBitBoolean(this.indicators.CP, bool); }

    /**
     * @description Whether the user is an in-game moderator
     * @type {boolean}
     * @param {boolean} bool
     */

    get MOD() { return this.has(this.indicators.MOD); }
    set MOD(bool) { return this.resolveBitBoolean(this.indicators.MOD, bool); }

    /**
     * @description Whether the user is an in-game elder moderator
     * @type {boolean}
     * @param {boolean} bool
     */

    get MOD_ELDER() { return this.has(this.indicators.MOD_ELDER); }
    set MOD_ELDER(bool) { return this.resolveBitBoolean(this.indicators.MOD_ELDER, bool); }

    /**
     * @description Whether the user is an in-game leaderboard moderator
     * @type {boolean}
     * @param {boolean} bool
     */

    get MOD_LEADERBOARD() { return this.has(this.indicators.MOD_LEADERBOARD); }
    set MOD_LEADERBOARD(bool) { return this.resolveBitBoolean(this.indicators.MOD_LEADERBOARD, bool); }

    /**
     * @description Whether the user is a part of the official leaderboard team
     * @type {boolean}
     * @param {boolean} bool
     */

    get LEADERBOARD_TEAM() { return this.has(this.indicators.LEADERBOARD_TEAM); }
    set LEADERBOARD_TEAM(bool) { return this.resolveBitBoolean(this.indicators.LEADERBOARD_TEAM, bool); }

    /**
     * @description Whether the user has a global rank
     * @type {boolean}
     * @param {boolean} bool
     */

    get HAS_RANK_GLOBAL() { return this.has(this.indicators.HAS_RANK_GLOBAL); }
    set HAS_RANK_GLOBAL(bool) { return this.resolveBitBoolean(this.indicators.HAS_RANK_GLOBAL, bool); }

    /**
     * @description Whether the user is banned from the global leaderboard
     * @type {boolean}
     * @param {boolean} bool
     */

    get RANK_GLOBAL_BANNED() { return this.has(this.indicators.RANK_GLOBAL_BANNED); }
    set RANK_GLOBAL_BANNED(bool) { return this.resolveBitBoolean(this.indicators.RANK_GLOBAL_BANNED, bool); }

    /**
     * @description Whether the user is on the manual top leaderboard
     * @type {boolean}
     * @param {boolean} bool
     */

    get TOP_MANUAL() { return this.has(this.indicators.TOP_MANUAL); }
    set TOP_MANUAL(bool) { return this.resolveBitBoolean(this.indicators.TOP_MANUAL, bool); }

    /**
     * @description Whether the user is a staff member in the official game Discord server
     * @type {boolean}
     * @param {boolean} bool
     */

    get OFFICIAL_GUILD_STAFF() { return this.has(this.indicators.OFFICIAL_GUILD_STAFF); }
    set OFFICIAL_GUILD_STAFF(bool) { return this.resolveBitBoolean(this.indicators.OFFICIAL_GUILD_STAFF, bool); }

    /**
     * @description Whether the user is a staff member in the official game Discord server for the leaderboard
     * @type {boolean}
     * @param {boolean} bool
     */

    get OFFICIAL_LEADERBOARD_GUILD_STAFF() { return this.has(this.indicators.OFFICIAL_LEADERBOARD_GUILD_STAFF); }
    set OFFICIAL_LEADERBOARD_GUILD_STAFF(bool) { return this.resolveBitBoolean(this.indicators.OFFICIAL_LEADERBOARD_GUILD_STAFF, bool); }

}

UserStatusGD.INDICATORS = {

    // General (0 - 9)
    ACCOUNT: 1 << 0,
    CP: 1 << 1,

    // Mods (10 - 20)
    MOD: 1 << 10,
    MOD_ELDER: 1 << 11,
    MOD_LEADERBOARD: 1 << 12,

    LEADERBOARD_TEAM: 1 << 13,

    // Top Leaderboards (21 - 34)
    HAS_RANK_GLOBAL: 1 << 21,
    RANK_GLOBAL_BANNED: 1 << 22,

    TOP_MANUAL: 1 << 23,
    
    // Discord (35-43)
    OFFICIAL_GUILD_STAFF: 1 << 35,
    OFFICIAL_LEADERBOARD_GUILD_STAFF: 1 << 36

};

module.exports = UserStatusGD;