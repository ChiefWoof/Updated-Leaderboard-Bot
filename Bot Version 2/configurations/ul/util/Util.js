"use strict";

class Util {}

/**
 * @description Generates a discord guild invite link with with a given code
 * @param {string} code The server invite code 
 * @returns {string} Generated invite code
 */

Util.createInviteLink = function(code) {
    return code ? `https://discord.gg/${code}` : null;
}

/**
 * @param {*} data 
 * @returns {boolean} Whether the entered data is a normal object
 */

Util.isObjectNormal = function(data) {
    return Object.prototype.toString.call(data) === "[object Object]";
}

module.exports = Util;