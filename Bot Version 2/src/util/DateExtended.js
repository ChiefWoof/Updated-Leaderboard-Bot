"use strict";

/**
 * @description An extension of the "Date" class with timezone support
 */

class DateExtended extends Date {

    /**
     * @description The amount of miliseconds the time is off from UTC time
     * @type {number}
     */

    get day() { return DateExtended.days[this.getDay()]; }

    /**
     * @description The amount of miliseconds the time is off from UTC time
     * @type {number}
     */

    get month() { return DateExtended.months[this.getMonth()]; }

    /**
     * @description The amount of miliseconds the time is off from UTC time
     * @type {number}
     */

    get timezoneOffset() { return this.getTimezoneOffset() * 60 * 1000; }

    /**
     * @description The amount of seconds the time is off from UTC time
     * @type {number}
     */

    get timezoneOffsetSeconds() { return Math.floor(this.timezoneOffset / 1000); }

    /**
     * @description The amount of seconds the time is off from UTC time
     * @type {number}
     */

    get timezoneOffsetMinutes() { return Math.floor(this.timezoneOffset / 1000 / 60); }

    /**
     * @description The amount of seconds the time is off from UTC time
     * @type {number}
     */

    get timezoneOffsetHours() { return Math.floor(this.timezoneOffset / 1000 / 60 / 60); }
    
    /**
     * @description returns a new instance based on a timezone
     * @param {number|string} offset The milisecond offset from UTC time
     */

    toTimezone(offset=0) {
        offset = typeof offset === "string" && offset in DateExtended.timezoneOffsets
            ? DateExtended.timezoneOffsets[offset]
        : typeof offset === "number"
            ? offset
        : 0;
        this.setTime(this.getTime() + 60 * 1000 * this.getTimezoneOffset() + offset);
        return this;
    }

}

/**
 * @description A collection timezones' hour offsets compared to UTC
 */

DateExtended.timezoneOffsets = {

    // UNIVERSAL TIME
    GMT: 0 * 1000 * 60 * 60,
    UTC: 0 * 1000 * 60 * 60,

    // HOUR-BASED TIMEZONES
    MIT: -11 * 1000 * 60 * 60,

    HST: -10 * 1000 * 60 * 60,

    AST: -9 * 1000 * 60 * 60,

    PST: -8 * 1000 * 60 * 60,

    PNT: -7 * 1000 * 60 * 60,
    MST: -7 * 1000 * 60 * 60,

    CST: -6 * 1000 * 60 * 60,

    IET: -5 * 1000 * 60 * 60,
    EST: -5 * 1000 * 60 * 60,

    PRT: -4 * 1000 * 60 * 60,

    BET: -3 * 1000 * 60 * 60,
    AGT: -3 * 1000 * 60 * 60,

    BRST: -2 * 1000 * 60 * 60,
    FNT: -2 * 1000 * 60 * 60,
    GST: -2 * 1000 * 60 * 60,
    PMDT: -2 * 1000 * 60 * 60,
    UYST: -2 * 1000 * 60 * 60,
    WGST: -2 * 1000 * 60 * 60,

    ECT: 1 * 1000 * 60 * 60,

    CEST: 2 * 1000 * 60 * 60,
    EET: 2 * 1000 * 60 * 60,
    ART: 2 * 1000 * 60 * 60,

    EAT: 3 * 1000 * 60 * 60,

    NET: 4 * 1000 * 60 * 60,

    PLT: 5 * 1000 * 60 * 60,

    BST: 6 * 1000 * 60 * 60,

    VST: 7 * 1000 * 60 * 60,

    CTT: 8 * 1000 * 60 * 60,

    JST: 9 * 1000 * 60 * 60,

    AET: 10 * 1000 * 60 * 60,

    SST: 11 * 1000 * 60 * 60,

    NST: 12 * 1000 * 60 * 60

};

/**
 * @description An object version of the months
 */

DateExtended.months = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December"
};

/**
 * @description An object version of the days
 */

DateExtended.days = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
};

module.exports = DateExtended;