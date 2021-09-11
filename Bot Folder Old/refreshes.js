const settings = require("./libraries/settings.json");
const private = require("./libraries/private.json");
const emotes = require("./ul/Discord/emotes.json");
const woof = require("./libraries/extensions.js");
const Discord = require("discord.js");
const actions = require("./libraries/actions");
const gs = require("./googlesheets");
const ul = require("./ul");

///////////////////////////////////
function spotlightEmbeds(data){
    if (data == null) return {};
    if (data.mainLevels == null) data.mainLevels = require("./libraries/GeometryDash/api").levelsMain;
    
    let returnValue = {}, users = woof.getItemsWithProperty(ul.properties.properties, require("./storedData/users.json"), 4, ul.properties.propertyComs[2]), embed = new Discord.MessageEmbed().setTitle(settings.lines.dashed).setFooter(data.updated == null ? null : data.updated);
    
    function clone(){
        return new Discord.MessageEmbed(JSON.parse(JSON.stringify(embed)));
    }

    function cloneUsers(){
        return JSON.parse(JSON.stringify(users));
    }

    if (data.bot != null && data.areaList != null) {
        let {areaList, bot} = data;

        returnValue[0] = clone()
            .setColor("365391")
            .setAuthor("Updated Leaderboard Analysis", woof.emote(emotes.ul.icon, 0, 0, 1))
            .setDescription(`${woof.emote(emotes.badges.helpers[2])} **Devs:** \`${cloneUsers().filter(user => +user[4] >= settings.levels.Developer).length}\` ${woof.emote(emotes.badges.helpers[1])} **Officers:** \`${cloneUsers().filter(user => +user[4] === settings.levels.Officer).length}\` ${woof.emote(emotes.badges.helpers[0])} **Helpers:** \`${cloneUsers().filter(user => +user[4] === settings.levels.Helper).length}\``)
            .addField(`_\n_:robot: __**UL Bot**__`, [`> **Guilds:** \`${bot.guilds.cache.size}\``, `> **Users:** \`${bot.users.cache.filter(user => user.bot ? false : true).size}\``].join("\n"))
            .addField(`_\n_:earth_americas: __**Top Regions**__`, areaList.regions.map((item, i) => {item = item.split(":"); return `> **${item[0]}:** \`${item[1]}\``}))
            .addField(`_\n_:earth_africa: __**Top Countries**__`, `${areaList.countries.map((item, i) => {item = item.split(":"); item[4] = woof.lookupCountry(item[0]); return `> ${item[4].icon} **${Array.isArray(item[4].country) && item[0].length > 10 ? item[4].country.includes("USA") ? "USA" :  item[4].country.sort((a, b) => a.length-b.length)[0] : item[0]}:** \`${item[1]}\``}).join("\n")}`);
    };

    returnValue[1] = clone()
        .setColor("27872f")
        .setAuthor("Main Levels Analysis", woof.emote(emotes.ul.play, 0, 0, 1))
        .setDescription(data.mainLevels.levels.map((lvl, i) => { i = (i+1).toString(); while (i.length < 2) i = `0${i}`; return `> ${woof.emote(lvl.difficultyEmote)} **${i}** \`${lvl.name}\``; }))
        .addField(`_\n_:bar_chart: **Analysis**`, ["stars", "demons", "scoins", "orbs"].map(item => {return `${woof.emote(emotes.stats[item])} \`${data.mainLevels.analysis[item]}\``}).join(" "));
    
    if (data.rates != null) returnValue[2] = clone()
        .setColor("FFD000")
        .setAuthor(`${new Date(Date.now()).getFullYear()} Rates Analysis`, woof.emote("427875694618345473", 0, 0, 1))
        .setDescription([`Rates`, `Features`, `Epics`, `Unrates:${emotes.levels.unrate}`].map(item => { item = item.split(":"); return `> ${+item[1] > 0 ? `${woof.emote(item[1])} ` : ``}**${item[0]}** \`${data.rates.rateInfo[item[0].toLowerCase()]}\``; }).join("\n"))
        .addField(`_\n_**Rates by...**`, [`Mods:modRegRates:${emotes.badges.mod[0][1]}`, `Elder Mods:modEldRates:${emotes.badges.mod[1][1]}`, `Star Grinders:sgRates:${emotes.badges.sg}`].map(item => { item = item.split(":"); return `${woof.emote(item[2])} **${item[0]}:** \`${data.rates.rateInfo[item[1]]}\``; }).join("\n"))
        .addField(`_\n_**Rate Data**`, [1, 10, 2, 3, 4, 5, 6, 7, 8, 9].map((stars, i) => {return `${woof.getRate(1, 0, stars)} **${stars})** \`${data.rates[stars]}\`${i%2 ? `\n` : ` `}`}).join(""));

    function gainsFields(inputEmbed, input, type){
        if ([inputEmbed, input, type].some(item => item == null)) return;

        Object.keys(input).map((stat, i) => {
            inputEmbed.addField(i === 0 ? `\n${type}` : `_\n_`, input[stat].map(item => {
                let amount = `${+item.amount < 0 ? "" : "+"}${item.amount}`;
                while (amount.length < 7) amount = `~${amount}`;

                return `> ${woof.emote(emotes.stats[stat])} \`${woof.replaceAdvanced(amount, "~", settings.characters.spaces)}\` ${item.username}`;
            }));
        });
    }

    if (data.yearly != null) {
        returnValue[3] = clone()
            .setColor("00D8FF")
            .setAuthor(`Leaderboard Analysis`, woof.emote(emotes.trophies.gold, 0, 0, 1));
        gainsFields(returnValue[3], data.yearly, "Top Year (+Gains)");
    };

    if (data.weekly != null) {
        returnValue[4] = clone()
            .setColor("00D8FF")
            .setAuthor(`Leaderboard Analysis`, woof.emote(emotes.trophies.gold, 0, 0, 1));
        gainsFields(returnValue[4], data.weekly, "Top Week (+Gains)");
    };

    return returnValue;
}

async function sendStatNotifications(client, packets, allAnnounce){
    let channels = woof.getItemsWithProperty(ul.properties.properties, require("./storedData/guilds.json"), 10, ul.properties.propertyComs[2]).map(guild => {
        guild[10] = Array.isArray(guild[10]) ? guild[10] : null;
        if (guild[10] == null) return;
        return {id: guild[10][0], type: +guild[10][1] > 0 ? +guild[10][1] : 0};
    }).filter(item => item != null);

    channels = Array.isArray(channels) ? channels : [channels];
    packets = Array.isArray(packets) ? packets : [packets];

    if (client == null) client = new Discord.Client();
    await client.login(private.tokens.main);

    if (allAnnounce) actions.actions[10](client);
    if (packets[0] == null) return;
    
    /**
     * @type_0 net score
     * @type_1 all users
     * @type_2 helpers + specialties
     * @type_3 Star Grinders
     * @type_4 Server members
     * @type_5 GD Mods
     */

    function useChannelPacket(packet){
        packet.packets = JSON.parse(JSON.stringify(packets))
            .filter(item => true === true ? true : typeof item.text === 'string' ? item.text.length > 0 : false)
            .filter(item => +item.mod > 0 || +item.sg > 0 || +item.lvl >= settings.levels.Special || +item.net >= (packet.type === 0 ? 65535 : 0));

        if (packet.type === 2) packet.packets = packet.packets.filter(item => +item.level >= settings.levels.Special);
        if (packet.type === 3) packet.packets = packet.packets.filter(item => +item.sg > 0);
        if (packet.type === 5) packet.packets = packet.packets.filter(item => +item.mod > 0);
        if (packet.type === 4) {
            packet.disIDs = JSON.parse(JSON.stringify(packet.id.guild.members.cache.map((user, id) => { return id; })));
            packet.packets = JSON.parse(JSON.stringify(packet.packets.filter(item => packet.disIDs.find(id => id === item.disID))));
            delete packet.disIDs;
        };

        packet.messages = [];
        packet.packets.map((notif, i) => {
            notif.text = `${settings.beta ? '\`(BETA)\` ' : ''}${notif.text}`;
            let box = packet.messages.find(item => Array.isArray(item) ? `${item.join("\n")}\n${notif.text}`.length <= 2000 ? true : false : false);
            if (box == null) {
                packet.messages.push([notif.text]);
            }else{
                box.push(notif.text);
            };
        });

        packet.messages.map(msg => {
            try {packet.id.send(msg.join("\n"))} catch {};
        });
    };

    channels.map(async channel => {
        channel = +channel > 0 ? {id: channel} : channel;
        channel = Object(channel);
        channel.type = +channel.type > 0 ? +channel.type : 0;

        if (!(+channel.id > 0)) return;
        if (settings.beta && channel.id != "636380620330893323") return;
        try { channel.id = await client.channels.fetch(channel.id); } catch {}
        if (channel.id == null) return;
        setTimeout(() => {try{ useChannelPacket(channel) } catch {}}, 3000);
    });
}
///////////////////////////////////

async function roleGiver(client, remove, removeNotListed, guild, id, users){
    try {
        users = Array.isArray(users) ? users : [users];
        guild = typeof guild === "object" ? guild : await client.guilds.cache.get(guild);
        
        if (!(guild == null)){
            guild.members.cache.map(user => {
                let isListed = users.find(id => id === user.user.id) === undefined ? 0 : 1,
                hasRole = user._roles.find(role => role === id) === undefined ? 0 : 1;

                if (!(isListed) && removeNotListed && hasRole) user.roles.remove(id).catch(err => {});
                if (!(isListed)) return;

                if (hasRole){
                    if (remove) user.roles.remove(id).catch(err => {});
                }else if (!(remove)){
                    user.roles.add(id).catch(err => {});
                };
            });
        };
    } catch (err) {
        console.log(err);
    };
}

async function gsRoles(client){
    const {top, verified, users, localGuild} = {
        top: [],
        verified: [],
        users: [],
        localGuild: settings.guilds.ul
    };

    gs.loadSheetTab(settings.sheets.controlPanel.tabs.data, {type: 1}, sheet => {
        let {rows} = sheet;

        rows.filter(row => row == null ? false : row.locked == null ? false : row.locked.toLowerCase() != "true").map(row => {
            let discord = row.discord == null ? null : row.discord.split("*")[row.discord.split("*").length-1];

            users.push({username: row.username, banFrom: row.banFrom, stars: row.stars, diamonds: row.diamonds, ucoins: row.ucoins, demons: row.demons, cp: row.cp, discord: discord});
            
            if (discord == null ? true : !(+discord > 0)) return;
            if (verified.find(id => id === discord) === undefined && Object.values(settings.botIDs).find(id => id === discord) === undefined) verified.push(discord);
        })

        let tops = {};
        Object.keys(settings.statKeys).map(key => {
            tops[key] = JSON.parse(JSON.stringify(users)).filter(row => +row[key] >= 0 ? row.banFrom == null ? true : !(row.banFrom.includes(settings.statEmotes[key])) : false).sort((a, b) => Number(b[key])-Number(a[key])).slice(0, 100).filter(row => row.discord == null ? false : +row.discord > 0).map(row => {
                if (top.find(id => id === row.discord) === undefined) top.push(JSON.parse(JSON.stringify(row.discord.toString())));
            });
        })

        try {roleGiver(client, 0, 0, localGuild.id, "585613572873125900", verified)} catch {};
        try {roleGiver(client, 0, 1, localGuild.id, "668588119125262336", top)} catch {};
    })
}

async function sgRoles(client){
    const {guildSG, guildUL, users} = {
        users: [],
        guildSG: await client.guilds.cache.get(settings.guilds.sg.id),
        guildUL: await client.guilds.cache.get(settings.guilds.ul.id)
    };

    if (!(guildSG == null)){
        guildSG.members.cache.map(user => {
            if (user.user.bot) return;
            if (guildUL.members.cache.get(user.user.id) == null) return;
            users.push(user.user.id);
        });

        try {roleGiver(client, 0, 0, guildUL, "585615424859668484", users)} catch {};
    };
}

async function cleanGS(){
    const doc = await gs.doc(settings.sheets.main.link);
    await doc.updateProperties({title: 'Updated Leaderboard'});
    Object.keys(doc._rawSheets).map(key => {
        if (isNaN(Number(key))) return;
        if (settings.acceptableGSTabs.some(item => item === key.toString())) return;
        try {doc._rawSheets[key].delete()} catch {};
    });
}

async function spotlight(client){
    if (client == null) {
        client = new Discord.Client();
        await client.login(private.tokens.main);
    };
    gs.loadTabs(settings.sheets.dataExtra.link, {data: settings.sheets.dataExtra.tabs.spotlight.id}, async sheet => {
        let updated = new Date(Date.now()), guilds = woof.getItemsWithProperty(ul.properties.properties, require("./storedData/guilds.json"), [18, 19], ul.properties.propertyComs[2]).filter(item => item == null ? false : [18, 19].every(key => item[key] != null)), data = {};
        if (!sheet.data[0]._rawData.every(item => typeof item === 'string' ? item.includes("{") : false)) return;

        sheet.data[0]._sheet.headerValues.map(key => {
            data[key] = JSON.parse(sheet.data[0][key]);
        });

        data.bot = client;
        data.updated = `Last updated: ${updated}`;
        data.embeds = spotlightEmbeds(data);

        guilds.map(async guild => {
            try {
                if (settings.beta && guild[18] != "662717119191973889") return; 
                let channel = await client.channels.fetch(guild[18]);
                if (channel == null) return;
                
                guild[19].map(async (msg, i) => {
                    if (!(+msg > 0)) return;

                    msg = await channel.messages.fetch(msg);
                    if (msg == null) return;

                    msg.edit("", data.embeds[i]).catch(err => {});
                })
            } catch (err) {console.log(err)};
        })
    })
}

function statNotificationsAndRefresh(){
    const gd = require("./libraries/GeometryDash/api"), users = woof.getItemsWithProperty(ul.properties.properties, require("./storedData/users.json"), [4, 26], ul.properties.propertyComs[2]).filter(item => item[4] != null && item[26] != null);
    let packets = [];
    
    gs.loadSheetTab(settings.sheets.controlPanel.tabs.data, {type: 1, count: 69}, async sheet => {
        let {tab} = sheet, headers = JSON.parse(JSON.stringify(tab.headerValues));
        if (!Array.isArray(headers)) return;
        headers = { names: headers, col: gs.headerColumns(headers) };

        await tab.loadCells(`A2:${headers.col.refreshPrevious}`);
        await Promise.all(sheet.rows.map(async row => {
            if (!(+row.accountID > 0)) return;

            let lastRefresh = {}, statsNew = null, statsOld = [{accountID: row.accountID, mod: +row.mod > 0 ? +row.mod : 0, username: row.username, diamonds: row.diamonds}];
            try { statsOld[1] = row.refreshPrevious.split(":")[1].split("|") } catch {statsOld[1] = []};
            Object.keys(new ul.packets.statObject()).map((key, i) => {
                if (+statsOld[1][i] >= gd.settings.stats.caps[key] || +statsOld[0][key] >= gd.settings.stats.caps[key]) {
                    lastRefresh[key] = +statsOld[1][i] > +statsOld[0][key] ? statsOld[0][key] : statsOld[1][i];
                    statsOld[0][key] = +statsOld[1][i] > +statsOld[0][key] ? statsOld[1][i] : statsOld[0][key];
                    return;
                };
                
                statsOld[0][key] = statsOld[1][i];
            });
            statsOld = statsOld[0];

            try { statsNew = await gd.getGJAccount(statsOld.accountID); } catch {};
            if (statsNew == null) return;

            statsNew.sg = row.sg == null ? 0 : row.sg.toLowerCase() === 'true' ? 1 : 0;
            statsNew.disID = row.discord == null ? null : +row.discord.split("*")[1] > 0 ? row.discord.split("*")[1] : null;
            statsNew.level = users.find(user => user[26] === row.accountID);
            statsNew.level = statsNew.level == null ? 0 : +statsNew.level[4];
            statsOld.net = woof.netScore(statsOld);
            statsNew.net = woof.netScore(statsNew);
            
            function getCell(getRow, getCol) {
                return tab.getCell((+getRow)-1, headers.names.findIndex(item => item === getCol));
            }

            Object.keys(lastRefresh).map(key => {
                statsNew[key] = statsOld[key];
                statsOld[key] = lastRefresh[key];
            });
            
            ["playerID", "username", "stars", "diamonds", "scoins", "ucoins", "demons", "cp", "mod"].map(key => {
                getCell(row._rowNumber, key).value = statsNew[key] == null ? "_" : key === 'username' ? statsNew[key].toString() : +statsNew[key];
            });
            
            ul.achievements.check(statsOld, statsNew).map(item => {
                if (["locked", "setBan"].some(item => row[item] == null ? false : row[item].toLowerCase() === 'true')) return;
                packets.push(item);
            });

            getCell(row._rowNumber, "refreshPrevious").value = `${Date.now()}:${Object.values(new ul.packets.statObject(statsNew)).join("|")}`;
        }));

        console.log("saving new data...")
        await tab.saveUpdatedCells();
        console.log("saved")
        sendStatNotifications(null, packets, true);
    })
}

module.exports = {
    refreshes: [
        {useable: (settings.beta ? 0 : 1), cooldown: 900000, execute: gsRoles},
        {useable: (settings.beta ? 0 : 1), cooldown: 900000, execute: sgRoles},
        {useable: (settings.beta ? 0 : 1), cooldown: 900000, execute: cleanGS},
        {useable: (settings.beta ? 0 : 1), cooldown: 900000, execute: spotlight},
        {useable: (settings.beta ? 0 : 1), cooldown: 7200000, execute: statNotificationsAndRefresh}
    ],
    gsRoles: gsRoles,
    sgRoles: sgRoles,
    cleanGS: cleanGS,
    spotlight: spotlight,
    statNotificationsAndRefresh: statNotificationsAndRefresh,
    sendStatNotifications: sendStatNotifications
};
