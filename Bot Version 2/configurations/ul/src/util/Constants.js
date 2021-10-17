"use strict";

const Color = require("../../../../src/util/Color");


const CLIENT_EVENTS = {
    DISCORD_USERS_ADD: "discordUsersAdd",
    DISCORD_USERS_DELETE: "discordUsersDelete",

    GD_ACCOUNTS_ADD: "gdAccountsAdd",
    GD_ACCOUNTS_DELETE: "gdAccountsDelete",
    GD_LEADERBOARD_TOP_MANUAL_USER_ADD: "gdLeaderboardTopManualUserAdd",
    GD_LEADERBOARD_TOP_MANUAL_USER_DELETE: "gdLeaderboardTopManualUserDelete",
    GD_LEVELS_ADD: "gdLevelsAdd",
    GD_LEVELS_DELETE: "gdLevelsDelete",

    RUN_REFRESH: "runRefresh",
    RUN_COMMAND: "runCommand",

    UL_ACCOUNTS_ADD: "ulAccountsAdd",
    UL_ACCOUNTS_DELETE: "ulAccountsDelete",
    UL_LEADERBOARD_ADD: "ulLeaderboardAdd",
    UL_LEADERBOARD_DELETE: "ulLeaderboardDelete"
};

exports.Client = {
    events: CLIENT_EVENTS
};

const DISCORD_INVITE_CODES = {
    woofland: "5cW7cUm",
    ul: "Uz7pd4d",
    gdLeaderboard: "QmcphSkfqm",
    gdMain: "geometrydash"
};

const DISCORD_EMBEDS = {
    titleDivider: "------------------------"
};

const DISCORD_MESSAGES = {
    embeds: DISCORD_EMBEDS
};

const DISCORD_EMOTES = require("./Emotes");

exports.Discord = {
    emotes: DISCORD_EMOTES,
    inviteCodes: DISCORD_INVITE_CODES,
    messages: DISCORD_MESSAGES
};

const UL_STAT_NAMES = {
    stars: [ "stars", "star" ],
    diamonds: [ "diamonds", "diamond", "gems", "gem" ],
    scoins: [ "scoins", "scoin", "secret coins", "secret coin", "coins", "coin", "secretcoins", "secretcoin" ],
    ucoins: [ "ucoins", "ucoin", "user coins", "user coin", "usercoins", "usercoin" ],
    demons: [ "demons", "demon" ],
    cp: [ "cp", "creator points", "creator point", "creatorpoints", "creator point" ],
    net: [ "net", "net score", "overall", "overall score" ]
};

const UL_STAT_NET_WEIGHTS = {

    stars: 1,
    diamonds: 0.5,
    scoins: 100,
    ucoins: 2,
    demons: 20,
    cp: 50,

    demonsList: 80 // Adds extra points per completion (demons + demonsList = 100)

};

const UL_STAT_EMOTES_SPREADSHEET = {
    stars: "🌟",
    diamonds: "💎",
    scoins: "🌕",
    ucoins: "⚪️",
    demons: "😈",
    cp: "🛠",
    net: "👑"
};

const UL_STAT_EMOTES = {
    spreadsheet: UL_STAT_EMOTES_SPREADSHEET
};

const UL_STATS = {
    names: UL_STAT_NAMES,
    netWeights: UL_STAT_NET_WEIGHTS,
    emotes: UL_STAT_EMOTES
};

const UL_COLOR_PRESETS = {
    UL: new Color("abcdef"),
    WOOF: new Color("FF31A4"),
    VALID: new Color("6be160"),
    INVALID: new Color("E16060"),
    COOLDOWN: new Color("454545"),
    SETTINGS: new Color("646464"),
    STARS: new Color ("FFD91E"),
    DIAMONDS: new Color ("1EB4FF"),
    SCOINS: new Color ("FEFF00"),
    UCOINS: new Color ("A3A3A3"),
    DEMONS: new Color ("E14B4B"),
    CP: new Color ("747474"),
    NET: new Color ("ae34eb")
};

exports.ul = {
    stats: UL_STATS,
    colors: UL_COLOR_PRESETS
};

exports.colors = {

};

const GOOGLE_SHEETS_SPREADSHEETS = {

    UL_DATABASE: {
        sheetID: "1ADIJvAkL0XHGBDhO7PP9aQOuK3mPIKB2cVPbshuBBHc",
        tabs: {
            data: { tabID: 1882367139n },
            data2: { tabID: 1203117321n },
            gdTopManual: { tabID: 1100134174n }
        }
    }

};

const GOOGLE_SHEETS = {
    spreadsheets: GOOGLE_SHEETS_SPREADSHEETS
};

exports.Google = {
    googlesheets: GOOGLE_SHEETS
};