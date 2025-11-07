"use strict";

const CacheManager = require("./CacheManager");

const { binarySearchSortInsertRemove } = require("../../util/Util");

/**
 * Manages a cache of Usernames linked to User data for fast searching.
 * Entries are stored in a local JSON file.
 * Each entry is structured as a JSON-friendly object created by createEntryByProfile().
 */

class CacheUserUsernamesManager extends CacheManager {

    static LOCAL_FILE_PATH = "../../database/local/caches/usernameSearch.json";

    constructor() {
        super();
        this.metadata.discordIDsToIndices = {};
        this.metadata.accountIDsToIndex = {};
    }

    hasDiscordID(disID) { return disID in this.metadata.discordIDsToIndices; }
    hasAccountID(accountID) { return accountID in this.metadata.accountIDsToIndex; }

    loadMetadata() {
        this.entries.forEach((entry, i) => {
            entry?.discordIDs?.forEach(id => this.hasDiscordID(id)
                ? this.metadata.discordIDsToIndices[`${id}`].push(i)
                : this.metadata.discordIDsToIndices[`${id}`] = [ i ]
            );
            this.metadata.accountIDsToIndex[`${entry.accountID}`] = i;
        });
    }

    createEntryByProfile(profile={}) {
        return {
            ulID: `${BigInt(profile?.ulID || 0)}`,
            accountID: `${BigInt(profile?.accountID || 0)}`,
            playerID: `${BigInt(profile?.playerID || 0)}`,
            username: profile.username,
            discordIDs: profile?.discords?.map(([id, tag]) => `${id}`)
            || profile.disID ? [ `${profile.disID}` ] : []
        };
    }

    addEntryByProfile(...profiles) {
        profiles.forEach(profile => {
            this.entries.splice(
                this.findUsernameAddIndex(profile.username),
                0,
                this.createEntryByProfile(profile)
            );
        })
    }

    validateEntry(entry) {
        let errors = [];
        if (!/^\d{1,}$/.test(entry?.accountID))
            errors.push("Invalid or missing accountID in data");
        if (typeof entry?.username !== "string"  || entry.username.length === 0)
            errors.push("Invalid or missing username in data");
        if (errors.length > 0)
            throw new Error(errors.join("; "));
        return true;
    }

    findUsernameAddIndex(username) {
        return binarySearchSortInsertRemove({
            order: this.constructor.ORDER,
            searchType: "PLACEMENT_RIGHT",
            toValue: (entry, iCompare) => iCompare == -1 ? 0 : entry.username.localeCompare(username, "en", { sensitivity: "accent" })
        }, this.entries, { username });
    }

    findUsernameIndex(username) {
        return binarySearchSortInsertRemove({
            order: this.constructor.ORDER,
            searchType: "SEARCH",
            toValue: entry => entry.username.localeCompare(username, "en", { sensitivity: "accent" })
        }, this.entries, { username });
    }

    searchUsernamesIndexStartsWith(str) {

        let regex = new RegExp(`^${str}`, "i");
        let i = this.findUsernameAddIndex(str);
        let offset = 0;

        let res = [];

        if (regex.test(this.entries[i].username)) res.push(i);

        while (i + (--offset) >= 0 && regex.test(this.entries[i + offset].username)) res.unshift(i + offset);
        
        offset = 0;
        while (i + (++offset) < this.entries.length && regex.test(this.entries[i + offset].username)) res.push(i + offset);
        
        return res;
    }

    reset() {
        this.metadata = {
            discordIDsToIndices: {},
            accountIDsToIndex: {}
        };
        this.entries = [];
    }

    resetWithProfiles(...profiles) {
        this.reset();
        this.addEntryByProfile(...profiles);
        this.loadMetadata();
    }

}

module.exports = CacheUserUsernamesManager;