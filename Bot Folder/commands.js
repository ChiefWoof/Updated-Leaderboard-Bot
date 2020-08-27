const settings = require("./libraries/settings.json");
const gd = require("./libraries/GeometryDash/api.js");
const emotes = require("./ul/Discord/emotes.json");
const woof = require("./libraries/extensions.js");
const actions = require("./libraries/actions.js");
const gs = require("./googlesheets.js");
const Discord = require("discord.js");
const ul = require("./ul/index");
const ms = require("ms");
const refreshes = require("./refreshes");
var timeouts = {};

function timeoutsFilter(){
    let returnObj = {};

    Object.keys(timeouts).map(id => {
        if (Number(id) > 0){
            let timeoutLocal = woof.groups((typeof timeouts[id] === "string" ? timeouts[id] : "").split(":"), 2, 1).map((p, i) => {
                return (Array.isArray(p) ? p : []).some(item => isNaN(Number(item))) ? null : !(typeof settings.timeouts[p[0]] === "string") ? null : Date.now()-Number(p[1]) >= Number(settings.timeouts[p[0]].split(":")[0]) ? null : p.join(":");
            }).filter(item => !(item === null));
            if (timeoutLocal.length > 0){
                returnObj[id] = timeoutLocal.sort((a, b) => Number(b.split(":")[1])-Number(a.split(":")[1])).join(":");
            };
        };
    });

    timeouts = returnObj;
    module.exports.timeouts = timeouts;
};

function timeoutsCheck(id, disID, getNum, getLong){
    timeoutsFilter();

    let localTimeouts = (typeof timeouts[disID] === "string" ? woof.groups(timeouts[disID].split(":"), 2, 1) : []).filter(item => Array.isArray(item) && Array.isArray(item) ? Number(item[0]) === Number(id) && Number(id) > 0 : false).sort((a, b) => Number(b[1]) - Number(a[1]));
    localTimeouts = getNum ? localTimeouts.length > 0 ? Number(typeof settings.timeouts[localTimeouts[0][0]] === "string" ? settings.timeouts[localTimeouts[0][0]].split(":")[0] : NaN)-(Date.now()-Number(localTimeouts[0][1])) : 0 : localTimeouts.length > 0 ? 0 : 1;
    return getNum ? ms(localTimeouts, {long: getLong ? true : false}) : localTimeouts;
}

function timeoutsAdd(id, disID){
    if (+disID > 0){
        id = (Array.isArray(id) ? id : typeof id === "string" ? id.split(":") : [id]).map(id => {
            return typeof settings.timeouts[id] === "string" ? `${id}:${Date.now()}` : null;
        }).filter(item => typeof item === "string");
        
        timeouts[disID] = typeof timeouts[disID] === "string" ? `${timeouts[disID]}:${id.join(":")}` : id.join(":");
    };
    timeoutsFilter();
}

///////////////////////////////////////////

function pinger(client, msg){
    let returnData = [],
    getDataGuild = woof.properties(ul.properties.properties, require("./storedData/guilds.json")[msg.guildID], ul.properties.propertyComs[2]);
    getDataGuild = Array.isArray(getDataGuild) ? getDataGuild[0] === undefined ? {} : getDataGuild[0] : {};
    
    let getDataUser = woof.properties(ul.properties.properties, require("./storedData/users.json")[msg.content.includes("@") ? woof.tagClean(msg.content) : msg.disID], ul.properties.propertyComs[2]);
    getDataUser = Array.isArray(getDataUser) ? getDataUser[0] === undefined ? {} : getDataUser[0] : {};
    getDataUser.level = getDataUser.level === undefined ? 0 : getDataUser.level;

    returnData.push(`**Time:** \`${ms(Math.abs(Date.now()-msg.raw.createdTimestamp), {long: true})}\``, `**Status:** \`${woof.objectReverse(settings.levels)[getDataUser.level]}\``, null, 1 === 1 ? null :`**Guild Data**${Number(getDataGuild.ulVerified) > 0 ? ` ${woof.emote(emotes.badges.ul)} _(UL Verified)_` : ``}`);
    
    msg.raw.channel.send(`${woof.emote(emotes.icons.woof)}:bone: _woof_\n`+returnData.filter(item => !(item == null)).map(item => {return `> ${item}`}).join("\n")).catch(err => {});
}

async function requestUser(client, msg){
    let localEmbed = new Discord.MessageEmbed().setTitle(woof.loadingMsg(1)),
    helperPass = msg.slashes >= 1 && msg.level >= settings.levels.Special ? msg.slashes > 1 ? 2 : 1 : 0;
    
    const botMsg = await msg.raw.channel.send(localEmbed);

    if (msg.content.length === 0){
        setTimeout(() => { botMsg.edit(msg.command.help).catch(err => {}); }, 1500);
    }else{
        let user = await gd.playerToAccount(msg.content);
        
        localEmbed
            .setColor(settings.colorKey.error)
            .setTitle(`${woof.emote(emotes.ul.error)} ${settings.texts.error}`);
        
        if (Number(user) < 0){
            localEmbed.setDescription(`${Number(user) === -1 ? settings.texts.user : settings.texts.servers}`);
            setTimeout(() => { botMsg.edit(localEmbed).catch(err => {}); }, 750);
        }else if (typeof user === "object"){

            if (helperPass > 1 ? false : await actions.actions[11](client, msg, user.accountID)) {
                localEmbed.setDescription(`${settings.texts.inRequestCache} \`\`\`${settings.texts.inRequestCacheDesc}\`\`\``);
                setTimeout(() => { botMsg.edit(localEmbed).catch(err => {}); }, 750);
                return;
            };

            function loadEmbed(success, info, desc, addition){
                localEmbed.fields = [];
                woof.embedPlayerDefault(localEmbed, user, `Request for ${user.username}`);
                localEmbed
                    .setTitle(woof.statsDisplay(user, ["stars", "demons", "cp"], emotes.stats, 1).join(" "))
                    .setColor(success === -1 ? settings.colorKey.cooldown : success ? settings.colorKey.valid : settings.colorKey.error);
                
                if (typeof info === "string" ? info.length > 0 : false){
                    localEmbed.setDescription(`_\n_${woof.emote(success === -1 ? emotes.levels.length : success ? emotes.ul.valid : emotes.ul.error)} **${info}**`);
                };

                if (typeof desc === "string" ? desc.length > 0 : false){
                    localEmbed.addField(settings.lines.solid, `\`\`\`${desc}\`\`\`${typeof addition === "string" ? addition.length > 0 ? `\n${addition}` : `` : ``}`);
                };
            };

            gs.loadTabs(settings.sheets.controlPanel.link, {res: settings.sheets.controlPanel.tabs.data.id, hackers: settings.sheets.controlPanel.tabs.hackers.id}, rows => {
                let userFound = rows.res.find(item => +item.accountID > 0 ? item.accountID.toString() === user.accountID.toString() : false),
                userFoundHack = rows.hackers.find(item => +item.playerID > 0 ? item.playerID.toString() === user.playerID.toString() : false);

                if (!(helperPass > 1) && (userFoundHack == null ? false : userFoundHack.toggle == null ? false : userFoundHack.toggle.toLowerCase() === "true" ? false : true)){
                    loadEmbed(0, settings.texts.userOnHL, settings.texts.userOnHLDesc);
                    botMsg.edit(localEmbed).catch(err => {});
                }else if (!(userFound === undefined) && !(helperPass > 1)){
                    if (woof.bool(userFound.locked)){
                        loadEmbed(0, settings.texts.requestableNot, settings.texts.requestableNotDesc);
                    }else{
                        loadEmbed(0, settings.texts.onUL, settings.texts.clone);
                    };
                    botMsg.edit(localEmbed).catch(err => {});
                }else{
                    let resReq = woof.requestRequirements(user);
                    if (resReq === 0 && !(helperPass > 1)){
                        loadEmbed(0, settings.texts.requirementsFalse, woof.requestRequirements());
                        botMsg.edit(localEmbed).catch(err => {});
                    }else if (resReq > 0 || helperPass > 1){
                        gd.userCheck(client, msg, 1, user, 0, 1, 1, 1, function(resCheck){
                            gd.userCheckRes(client, msg, resCheck, user);
                            if ((resCheck === undefined ? true : !(resCheck.response === 1)) && !(helperPass > 1)){
                                if (resCheck === undefined ? false : resCheck.response === -4){
                                    loadEmbed(0, settings.texts.commentHistoryNone, settings.texts.commentHistoryNoneDesc);
                                }else{
                                    loadEmbed(0, settings.texts.odd, settings.texts.mistake);
                                };
                                botMsg.edit(localEmbed).catch(err => {});
                            }else if (resCheck.response === 1 || (helperPass > 1)){
                                function sendUser(type){
                                    let timeoutPass = timeoutsCheck(1, msg.disID);

                                    if (timeoutPass || helperPass > 0){
                                        timeoutsAdd(1, msg.disID);
                                        user.disID = msg.disID;
                                        user.disTag = msg.disTag;
                                        user.guildName = msg.guildName;
                                        user.guildID = msg.guildID;
                                        user.level = msg.level;
                                        user.dm = type;
                                        user.isOwner = 0;
                                        user.gamemode = +resCheck.gamemode > 0 ? resCheck.gamemode : 0;
                                        let keepUserData = JSON.parse(JSON.stringify(user));
                                        actions.actions[1](client, msg, user, resCheck, function(resAction){
                                            localEmbed = new Discord.MessageEmbed()
                                            .setColor(resAction ? settings.colorKey.valid : settings.colorKey.error)
                                            .setDescription(`${woof.emote(resAction ? emotes.ul.valid : emotes.ul.error, 0, "hai_"+woof.base64(woof.properties(ul.properties.properties, keepUserData, ul.properties.propertyComs[2]), 1, 1, 1))} ${resAction ? `**${user.username}** has been sent to the helper team, ${msg.raw.author.username}`: `An error occured`}`);
                                            botMsg.edit(localEmbed).catch(err => {});
                                        });
                                    }else{
                                        msg.page = 0;
                                        let localTime = timeoutsCheck(1, msg.disID, 1, 1);
                                        loadEmbed(-1, settings.texts.cooldown, settings.texts.cooldownTime+(localTime > 0 ? 0 : localTime));
                                        botMsg.edit(localEmbed);
                                    };
                                }

                                loadEmbed(1, settings.texts.requestable, "USE or TYPE one of the corresponding reactions OR subcommands to the question below", `${woof.emote(emotes.ul.warning)} _This question has changed recently_\n\n**Do you want me to send you a direct message if this user gets added?**\n\n> ${woof.emote(emotes.levels.likes)} \`Yes, message me\`\n> ${woof.emote(emotes.levels.dislikes)} \`No, don't message me\`\n> \n> *__Alternative:__ type "yes" or "no"*\n_\n_`);
                                botMsg.edit(localEmbed).then(edited => {
                                    msg.awaitReactions(botMsg, 300000, 0, function(reaction, user){
                                        if (reaction._emoji.id === emotes.levels.dislikes){
                                            msg.page = -1;
                                            sendUser(0);
                                        }else if (reaction._emoji.id === emotes.levels.likes){
                                            msg.page = -1;
                                            sendUser(1);
                                        };
                                    })

                                    msg.awaitMessages(300000, 0, 0, function(newMsg){
                                        if (newMsg.content.toLowerCase() === "no"){
                                            msg.page = -1;
                                            sendUser(0);
                                        }else if (newMsg.content.toLowerCase() === "yes"){
                                            msg.page = -1;
                                            sendUser(1);
                                        };
                                    })

                                    woof.reacts(botMsg, [emotes.levels.dislikes, emotes.levels.likes]);
                                });
                            };
                        });
                    };
                };
            });
        };
    };
}

async function help(client, msg, forcePage){
    let cmds = JSON.parse(JSON.stringify(commands)).filter(cmd => cmd.level <= msg.level).sort((a, b) => a.commands[0] - b.commands[0]).sort((a, b) => a.level - b.level), localEmbedMain = new Discord.MessageEmbed()
        .setColor(settings.colorKey.ul)
        .setAuthor(`Updated Leaderboard Information`, woof.emote(emotes.ul.icon, 0, 0, 1), settings.links.googlesheet+settings.sheets.main.link)
        .setFooter(`Type the NAME of the page or command in order to view it`, woof.emote(emotes.ul.info, 0, 0, 1));

    let desc = `${woof.emote(emotes.media.discord)} [Our Discord Server](${settings.links.serverUL}) :robot: [UL Bot Invite](${settings.links.botInvite})`;
    desc += `\`\`\`"Let's keep it real. Over the years, the Geometry Dash Top players and the GD mod team have heavily lacked someone that could do more than just copy everyone else that came before them, I'm here to fill that gap. The Updated Leaderboard was built to make noses turn, not to be mediocre..."\`\`\`*- XShadowWizardX 8=8*`;
    desc += `\n\n${[`${woof.emote(emotes.ul.googlesheets)} [Googlesheet Leaderboard](${settings.links.googlesheet+settings.sheets.main.link})`, `${woof.emote(emotes.stats.scoins)} [GDBrowser Leaderboard](${[settings.links.gdBrowser.link, settings.links.gdBrowser.endPoints.leaderboard].join("/")})`, ``, `*Prefixes:*${settings.prefixes.map(item => {return ` \`${item}\``}).join(", ")}`].map(item => {return `${item}`}).join("\n")}`;
    localEmbedMain.setDescription(desc+"\n_\n_");

    localEmbedMain.addField(`Extra Pages`, [`helpers`, `badges`].map(item => {return `> \`${item}\``}));
    localEmbedMain.addField(`Commands`, cmds.length > 0 ? cmds.map(cmd => {return `> \`${cmd.commands[0]}\`${cmd.level >= settings.levels.Helper ? ` ${woof.emote(emotes.badges.helpers[cmd.level-settings.levels.Helper])}` : ``}${typeof cmd.subdesc === "string" ? ` - ${cmd.subdesc}` : ``}`}) : `*${settings.texts.empty}*`);

    let localEmbedBadges = new Discord.MessageEmbed()
        .setImage(settings.images.badges)
        .setColor(settings.colorKey.ul)
        .setTitle(`**Page:** \`UL Profile Badges\``)
        .setDescription(`> **User Badges** are displayed on a player's profile and ordered by value`)
        .setFooter(`Type "back" to view the page list`);

    let localEmbedHelpers = new Discord.MessageEmbed()
        .setColor(settings.colorKey.ul)
        .setTitle(`**Page:** \`UL Helpers\``)
        .setFooter(`Type "back" to view the page list`)
        .setDescription(`\`\`\`The Updated Leaderboard helper team\`\`\`\n> ${woof.emote(emotes.badges.helpers[0])} **Become a helper:**\n> *(Currently closed)*\n_\n_`)
        .addField(`**Helpers**`, woof.getItemsWithProperty(ul.properties.properties, require("./storedData/users.json"), [4, 22, 24], ul.properties.propertyComs[2]).filter(item => +item[4] >= settings.levels.Helper).sort((a, b) => +b[4] - +a[4]).map(user => {
            return `${woof.emote(emotes.badges.helpers[(+user[4])-settings.levels.Helper])} \`${user[22]}\` _- ${typeof user[24] === "string" ? user[24].split("_").join("\_") : user[24]}_`;
        }).join("\n"));

    let pages = {
        helpers: localEmbedHelpers,
        badges: localEmbedBadges,
        main: localEmbedMain,
        commands: JSON.parse(JSON.stringify(commands))
    };

    function reloadPage(input){
        input = typeof input === "string" ? input : "";
        input = pages[input] === undefined ? pages.commands.find(item => item.commands.find(cmd => cmd === input.toLowerCase())) : input;
        
        if (typeof input === "object" && !(input === undefined)){
            input = input.help === undefined ? new Discord.MessageEmbed() : new Discord.MessageEmbed(JSON.parse(JSON.stringify(input.help)));
            input.setFooter(`Type "back" to view the page list`);
        };

        return typeof input === "object" && !(input === undefined) ? input : typeof pages[input] === "object" && !(Array.isArray(pages[input])) && !(pages[input] === undefined) ? pages[input] : pages.main;
    }

    try {
        const botMsg = await msg.raw.channel.send(reloadPage(typeof forcePage === "string" ? forcePage : msg.content));
        if (botMsg == null) return;
        
        msg.awaitMessages(420000, 0, 0, function(newMsg){
            if (typeof newMsg.content != "string") return;

            newMsg.content = newMsg.content.toLowerCase();
            if (["back", "main", "badges", "helpers"].some(item => item === newMsg.content) || !(commands.find(item => item.commands.find(cmd => cmd === newMsg.content )) === undefined)) {
                botMsg.edit(reloadPage(newMsg.content));
                newMsg.delete().catch(err => {});
            };
        });
    } catch {};
}

async function breaker(client, msg){
    try {
        let channel = await client.channels.fetch(msg.channelID);
        message = await channel.messages.fetch(msg.content);

        if (message == null) return;

        let localEmbed = new Discord.MessageEmbed(), isSuccess = 0;

        if (Array.isArray(message.embeds) ? message.embeds[0] === undefined ? false : message.embeds[0].description.includes(":hai_") : false){
            isSuccess = 1;
            localEmbed.setDescription(":hai_"+message.embeds[0].description.split(":hai_")[1].split(":")[0]);
        }else if (typeof message.content === "string" ? message.content.includes(":hai_") : false){
            isSuccess = 1;
            localEmbed.setDescription(":hai_"+message.content.split(":hai_")[1].split(":")[0]);
        };

        if (isSuccess) message.edit("", localEmbed);
    } catch {};
            
        
}

async function leaderboard(client, msg){
    let locals = {
        page: msg.caller === "creators" ? "cp" : woof.lookupStat(msg.content, "stars"),
        user: null,
        server: 0,
        sg: 0,
        creators: 0,
        mods: 0,
        weekly: 0,
        yearly: 0,
        area: -1,
        users: [],
        usersGuild: msg.raw.guild === null ? [] : msg.raw.guild.members.cache.map(user => {return user.user.id}),
        useUsers: []
    }, localEmbed = new Discord.MessageEmbed().setTitle(woof.loadingMsg(1));
    
    const botMsg = await msg.raw.channel.send(localEmbed);
        
    gs.loadTabs(settings.sheets.controlPanel.link, {sheet: settings.sheets.controlPanel.tabs.data.id, sheet2: settings.sheets.controlPanel.tabs.oldData.id, sheet3: settings.sheets.controlPanel.tabs.year2020.id}, async rows => {
        const {sheet, sheet2, sheet3} = rows;
        const rUsers = Array.isArray(sheet) ? sheet.filter(user => typeof user.locked === "string" ? user.locked.toLowerCase() === "false" : false) : [],
        rWeekly = Array.isArray(sheet2) ? sheet2 : [],
        rYearly = Array.isArray(sheet3) ? sheet3 : [];
        let userRow = rUsers.findIndex(user => typeof user.discord === "string" && +msg.disID > 0 ? user.discord.split("*")[user.discord.split("*").length-1] === msg.disID : false),
        localAreaString = -1,
        userArea = null;

        let res = await gd.getGJAccount(userRow >= 0 ? rUsers[userRow].accountID : -1);
        
        if (!(userRow === undefined) && userRow >= 0 && typeof res === "object" && !(res === undefined)){
            rUsers[userRow].stars = res.stars;
            rUsers[userRow].diamonds = +rUsers[userRow].diamonds > gd.settings.stats.caps.diamonds ? rUsers[userRow].diamonds : res.diamonds;
            rUsers[userRow].scoins = res.scoins;
            rUsers[userRow].ucoins = res.ucoins;
            rUsers[userRow].demons = res.demons;
            rUsers[userRow].cp = res.cp;
            rUsers[userRow].mod = res.mod;
            rUsers[userRow].playerID = res.playerID;
            rUsers[userRow].username = res.username;
            rUsers[userRow].medias = [res.youtube, res.twitter, res.twitch].map(item => {return typeof item === "string" ? item.length > 0 ? item : "_" : "_"}).join("+");
            rUsers[userRow].discord = `${msg.disTag}*${msg.disID}`;
            userArea = typeof rUsers[userRow].country === "string" ? rUsers[userRow].country.length > 0 ? woof.lookupCountry(rUsers[userRow].country) : userArea : userArea;
            try {rUsers[userRow].save()} catch {};
        };

        rUsers.map(user => {
            let uWeekly = rWeekly.find(userRow => +user.accountID > 0 && user.accountID === userRow.accountID),
            uYearly = rYearly.find(userRow => +user.accountID > 0 && user.accountID === userRow.accountID);
            
            uWeekly = uWeekly === undefined ? [] : typeof uWeekly["1 Week Ago"] === "string" ? uWeekly["1 Week Ago"].split("|") : [];
            uWeekly = uWeekly.every(item => +item >= 0 && !(item === "") && !(item === " ")) ? woof.statsObject({stars: +uWeekly[0], diamonds: +uWeekly[1], scoins: +uWeekly[2], ucoins: +uWeekly[3], demons: +uWeekly[4], cp: +uWeekly[5]}, 1) : {};
            uYearly = uYearly === undefined ? {} : woof.statsObject({stars: uYearly.stars, diamonds: uYearly.diamonds, scoins: uYearly.scoins, ucoins: uYearly.ucoins, demons: uYearly.demons, cp: uYearly.cp}, 1);

            if (Object.values(uYearly).every(item => +item >= 0 && !(item === "") && !(item === " "))){
                Object.keys(uYearly).map(key => {
                    uYearly[key] = +uYearly[key];
                })
            }else{
                uYearly[key] = {};
            };

            if (typeof user === "object" && !(user === undefined)){
                if (+user.accountID > 0){
                    locals.users.push({
                        username: typeof user.username === "string" ? user.username.length > 0 ? user.username : "-" : "-",
                        accountID: user.accountID,
                        playerID: user.playerID,
                        disID: typeof user.discord === "string" ? +user.discord.split("*")[user.discord.split("*").length-1] > 0 ? user.discord.split("*")[user.discord.split("*").length-1] : "0" : "0",
                        bans: woof.banFrom(user.banFrom),
                        mod: +user.mod > 0 ? +user.mod : 0,
                        sg: typeof user.sg === "string" ? user.sg.toLowerCase() === "true" ? 1 : 0 : 0,
                        creator: +user.cp >= 10 ? 1 : 0,
                        region: typeof user.region === "string" ? user.region : "_",
                        country: typeof user.country === "string" ? user.country : "_",
                        state: typeof user.state === "string" ? user.state : "_",
                        count: 0,
                        stats: woof.statsObject(user, 1),
                        statsWeekly: uWeekly,
                        statsYearly: uYearly
                    });
                };
            };
        })

        locals.users = locals.users.sort((a, b) => +b.accountID - +a.accountID);

        function reloadData(localArea){
            locals.useUsers = JSON.parse(JSON.stringify(locals.users));

            if (locals.mods) locals.useUsers = locals.useUsers.filter(user => +user.mod > 0);
            if (locals.creators) locals.useUsers = locals.useUsers.filter(user => +user.creator > 0);
            if (locals.sg) locals.useUsers = locals.useUsers.filter(user => +user.sg > 0);
            if (locals.server) locals.useUsers = locals.useUsers.filter(user => !(locals.usersGuild.find(id => id === user.disID) === undefined));
        
            locals.area = localArea === -1 ? "none" : typeof localArea === "string" ? localArea : locals.area;
            if (typeof locals.area === "string"){
                localAreaString = JSON.parse(JSON.stringify(locals.area));
                if (localAreaString.toLowerCase() === "none" || localAreaString.toLowerCase() === "_"){
                    localAreaString = -1;
                }else{
                    localAreaString = woof.lookupState(localAreaString) === null ? woof.lookupCountry(localAreaString) === null ? woof.lookupRegion(localAreaString) : woof.lookupCountry(localAreaString) : woof.lookupState(localAreaString);
                    try {
                        localAreaString = localAreaString === null ? null : typeof localAreaString === "string" ? {icon: 0, area: localAreaString} : localAreaString.state === undefined ? {icon: localAreaString.icon, area: Array.isArray(localAreaString.country) ? localAreaString.country[0] : localAreaString.country} : {icon: 0, area: Array.isArray(localAreaString.state) ? localAreaString.state[0] : localAreaString.state};
                        locals.useUsers = locals.useUsers.filter(user => ["region", "country", "state"].some(item => typeof user[item] === "string" ? user[item].toLowerCase() === localAreaString.area.toLowerCase() : false));
                    } catch {
                        locals.useUsers = [];
                    };
                };
            };
            
            if (locals.weekly || locals.yearly) locals.useUsers = locals.useUsers.filter(user => locals.yearly ? !(user.statsYearly === null) : locals.weekly ? !(user.statsWeekly === null) : true);
            
            locals.useUsers = locals.useUsers.filter(user => typeof user.bans === "object" && !(user.bans == null) ? locals.page === "net" ? !(Object.values(user.bans).some(item => +item > 0)) : !(user.bans[locals.page] === 1) : true);

            locals.useUsers = locals.useUsers.map(user => {
                user.count = Number(user.stats[locals.page]) - (locals.yearly ? Number(user.statsYearly[locals.page]) : locals.weekly ? Number(user.statsWeekly[locals.page]) : 0);
                return user;
            });

            if (locals.weekly && !(settings.caps.ldbrWeekly[locals.page] === undefined)){
                locals.useUsers = locals.useUsers.filter(user => user.count <= settings.caps.ldbrWeekly[locals.page]);
            };

            locals.useUsers = locals.useUsers.filter(user => !(isNaN(Number(user.count)))).sort((a, b) => Number(b.count) - Number(a.count));
        }

        function reloadPage(userSearch){
            locals.user = null;

            if (typeof userSearch === "string" ? userSearch.length > 0 : false){
                msg.localPage = locals.useUsers.findIndex(user => user[userSearch.includes("@") ? `disID` : isNaN(Number(userSearch)) ? `username` : `playerID`] === (userSearch.toLowerCase() === "me" ? msg.disID : userSearch.replace("@", "")));
                if (+msg.localPage >= 0) locals.user = JSON.parse(JSON.stringify(locals.useUsers[msg.localPage]));
                msg.localPage = +msg.localPage >= 0 ? Math.floor((+msg.localPage)/settings.caps.ldbrPerPage) : 0;
            };

            let useUsers = JSON.parse(JSON.stringify(locals.useUsers.slice(msg.localPage*settings.caps.ldbrPerPage, (msg.localPage+1)*settings.caps.ldbrPerPage))),
            descWarn = [], descCmds = [], desc = `> **Page:** \`${msg.localPage+1} of ${Math.ceil(locals.useUsers.length/settings.caps.ldbrPerPage)}\` _(${locals.useUsers.length} users)_`;

            desc += `\n> **Type:** \`${locals.yearly ? `Yearly` : locals.weekly ? `Weekly` : `Regular`}\``;
            desc += `\n> **Find:** ${typeof userSearch === "string" ? userSearch.length > 0 ? userSearch.includes("@") ? `<${userSearch}>` : `\`${userSearch}\`` : `_none_` : `_none_`}`;
            desc += `\n> \n> **Enabled Filters:** ${[locals.server, locals.sg, locals.mods, locals.creators].some(item => item > 0) ? [locals.server > 0 ? emotes.media.discord : 0, locals.sg > 0 ? emotes.badges.sg : 0, locals.mods > 0 ? emotes.badges.mod[0][1] : 0, locals.creators > 0 ? emotes.badges.cp[0][1] : 0].filter(item => +item > 0).map(item => {return woof.emote(item)}).join(" ") : `_none_`}`;
            desc += `\n> **Area:** ${localAreaString === -1 ? `_none_` : `${localAreaString === null || localAreaString === undefined ? `\`N/A\`` : typeof localAreaString === "string" ? `\`${localAreaString}\`` : `\`${localAreaString.area}\`${typeof localAreaString.icon === "string" ? ` ${localAreaString.icon}` : ``}`}`}`;

            if (locals.weekly || locals.yearly) descWarn.push(settings.texts.dataRefresh);
            if (locals.server) descWarn.push(settings.texts.onlyLinked);
            if (locals.creators) descWarn.push(settings.texts.onlyCreators);

            descWarn = `${descWarn.length > 0 ? `\n\n` : ``}${descWarn.map(item => {return `${woof.emote(emotes.ul.warning)} _${item}_`}).join("\n")}`;
            
            localEmbed = new Discord.MessageEmbed()
                .setColor(settings.colorKey[locals.page])
                .setAuthor(`UL ${settings.statKeys[locals.page][0]} Leaderboard`, woof.emote(emotes.stats[locals.page], 0, 0, 1))
                .setTitle(`Available Users and Areas`)
                .setURL(settings.links.areas)
                .setFooter("Type `commands` to "+`${msg.commands ? "hide" : "display"} subcommands`);
            
            localEmbed.addField(`${woof.emote(emotes.ul.settings)} **__Settings__**\n_\n_`, `${desc}${msg.commands ? "\n_\n_" : ""}`);
            
            if (msg.commands){
                descCmds.push(`\`next/prev\` - turns page`);
                descCmds.push(`\`page #\` - to page`);
                descCmds.push(`\`find <me/@disID/username/p-id>\` - user lookup`);
                descCmds.push(`\n_Type Change:_ \`Weekly\` \`Yearly\``);
                descCmds.push(Object.keys(settings.statKeys).map(item => {return `\`${item}\``}).join(" "));
                descCmds.push(`\n_Filters:_\n\`sg\` - Star Grinders' members\n\`mods\` - GD Mods\n\`server\` - Server members\n\`creators\` - Level Creators\n\`area <region/country/state>\``);
                localEmbed.addField(`**Commands**`, descCmds.join("\n")+"\n_\n_")
            };

            if (useUsers.length > 0){
                localEmbed.setDescription(useUsers.map((user, i) => {
                    i = (msg.localPage*settings.caps.ldbrPerPage)+i+1;
                    let isUser = typeof locals.user === "object" && !(locals.user === undefined) && !(locals.user === null) ? locals.user.playerID === user.playerID && +user.playerID > 0 : 0;

                    user.count = isNaN(Number(user.count)) ? `N/A` : Number(user.count).toString() ;
                    i = isNaN(Number(i)) ? `N/A` : Number(i).toString() ;

                    user.count = `${locals.weekly || locals.yearly ? `${Number(user.count) < 0 ? "" : "+" }${user.count}` : user.count}`;

                    while (user.count.length < 7){
                        user.count = `_${user.count}`;
                    };

                    while (i.length < 4){
                        i = `_${i}`;
                    };

                    user.count = woof.replaceAdvanced(user.count, '_', settings.characters.spaces);
                    i = `#${woof.replaceAdvanced(i, '_', settings.characters.spaces)}`;

                    return `${isUser ? `**` : ``}\`${i}\` ${woof.emote(emotes.stats[locals.page])} \`${user.count}\` | ${user.username}${isUser ? `**` : ``}`;
                }).join("\n")+`${descWarn}\n_\n_`);
            }else{
                localEmbed.setDescription(`*${settings.texts.empty}*${descWarn}\n_\n_`);
            };

            botMsg.edit(localEmbed);
        }

        reloadData();
        reloadPage();

        msg.awaitMessages(600000, 1, 1, (newMsg, reload) => {
            let lazy = [[["server", "member", "members"], "server"], [["sg", "star grinders"], "sg"], [["mods", "mod"], "mods"], [["creator", "creators"], "creators"], [["weekly", "week", "wk", "w"], "weekly"], [["yearly", "year", "yr", "y"], "yearly"]].find(item => item[0].find(item => item === newMsg.content.toLowerCase()));

            if (!(lazy === undefined)){
                if (lazy[1] === "weekly") locals.yearly = 0;
                if (lazy[1] === "yearly") locals.weekly = 0;
                locals[lazy[1]] = locals[lazy[1]] > 0 ? 0 : 1;
                msg.localPage = 0;
                reload = 1;
                reloadData();
            };

            Object.keys(settings.statKeys).map(key => {
                if ((Array.isArray(settings.statKeys[key]) ? settings.statKeys[key] : [key]).some(item => item.toLowerCase() === newMsg.content.toLowerCase())){
                    locals.page = key;
                    reload = 1;
                    reloadData();
                };
            });

            if (["area", "region", "country", "state"].some(item => newMsg.content.toLowerCase().startsWith(`${item} `))){
                locals.area = newMsg.content.split(" ").slice(1, newMsg.content.split(" ").length).join(" ");
                msg.localPage = 0;
                reload = 1;
                reloadData();
            };

            if (newMsg.content.toLowerCase().startsWith("find ")){
                let localContent = newMsg.content.substr(5, newMsg.content.length).toLowerCase();
                reload = 0;

                if (localContent === "none" || localContent === "_"){
                    reload = 1;
                }else{
                    if (newMsg.content.includes("@") || localContent === "me"){
                        reloadPage(`@${localContent === "me" ? msg.disID : woof.tagClean(localContent)}`);
                    }else if (!(isNaN(Number(localContent)))){
                        reloadPage(localContent);
                    }else{
                        gd.playerToAccount(localContent, function(res){
                            if (typeof res === "object" && !(res === undefined)){
                                reloadPage(res.playerID);
                            };
                        });
                    };
                };
            };

            if (reload){
                reloadPage();
                newMsg.delete().catch(err => {});
            };
        })

        msg.awaitReactions(botMsg, 600000, 1, (newReact, user, reload) => {
            let lazy = [[emotes.media.discord, "server"], [emotes.badges.sg, "sg"], [emotes.badges.mod[0][1], "mods"], [emotes.badges.cp[0][1], "creators"], ["🇼", "weekly"], ["🇾", "yearly"]].find(item => newReact._emoji.id === item[0] ? true : newReact._emoji.name === item[0]);

            if (!(lazy === undefined)){
                if (lazy[1] === "weekly") locals.yearly = 0;
                if (lazy[1] === "yearly") locals.weekly = 0;
                locals[lazy[1]] = locals[lazy[1]] > 0 ? 0 : 1;
                msg.localPage = 0;
                reload = 1;
                reloadData();
            };

            lazy = [[emotes.stats.stars, "stars"], [emotes.stats.diamonds, "diamonds"], [emotes.stats.scoins, "scoins"], [emotes.stats.ucoins, "ucoins"], [emotes.stats.demons, "demons"], [emotes.stats.cp, "cp"], [emotes.stats.net, "net"]].find(item => newReact._emoji.id === item[0] ? true : newReact._emoji.name === item[0]);

            if (!(lazy === undefined)){
                locals.page = lazy[1];
                reload = 1;
                reloadData();
            };

            if (newReact._emoji.name === "👤") {
                reload = 0;
                reloadPage(`${locals.user == null ? `@${msg.disID}` : locals.user.disID === msg.disID ? `none` : `@${msg.disID}`}`);
            };

            if (!(userArea === null)){
                if (newReact._emoji.name === userArea.icon) {
                    msg.localPage = 0;
                    reload = 1;

                    locals.area = woof.lookupCountry(locals.area);
                    if (locals.area === null){
                        reloadData(Array.isArray(userArea.country) ? userArea.country[0] : userArea.country);
                    }else{
                        reloadData(-1);
                    };
                };
            };

            if (reload) reloadPage();
        })
        
        woof.reacts(botMsg, [emotes.ul.prev, emotes.ul.next, "👤", (userArea === null ? userArea : userArea.icon), "🇾", "🇼", emotes.media.discord, emotes.badges.sg, emotes.badges.mod[0][1], emotes.badges.cp[0][1], ...Object.values(emotes.stats).slice(0, 7)]);
    })
}

async function profile(client, msg){
    msg.page = msg.caller === "levels" || msg.caller === "lvls" ? 1 : msg.caller === "cmts" ? 2 : msg.caller === "cmtslvls" ? 3 : msg.caller === "progress" || msg.caller === "prog" ? 4 : msg.caller === "settings" ? 999 : msg.caller === "hacks" ? 5 : 0;
    let useStat = msg.page === 4 ? woof.lookupStat(msg.content, null, 1, "startsWith") == null ? null : woof.lookupStat(msg.content, null, 1, "startsWith") : null,
    localEmbed = new Discord.MessageEmbed().setTitle(woof.loadingMsg(1)),
    botDataUsers = woof.getItemsWithProperty(ul.properties.properties, require("./storedData/users.json"), [4, 26], ul.properties.propertyComs[2]);
    
    if (!(useStat == null)) msg.content = msg.content.substr(useStat.length+1, msg.content.length);

    let data = {
        display: { settings: 0, helper: 0, hacker: 0, sg: 0, ul: 0, banFrom: [0, 0, 0, 0, 0, 0], locked: 0, setBan: 0, gamemode: 0 },
        user: `${msg.content.includes("@") || msg.content === "" ? `@${msg.content.includes("@") ? woof.tagClean(msg.content) : msg.disID}` : woof.playerKeyCheck(msg.content) == null ? msg.content : woof.playerKeyCheck(msg.content)}`,
        lvls: { data: [], analysis: {} },
        cmtsAcc: { data: [], analysis: {} },
        cmtsLvls: { data: [], analysis: {} },
        ul: null,
        oldData: [],
        year: null,
        hacker: null,
        settings: { stat: useStat == null ? "stars" : woof.lookupStat(useStat, "stars"), date: 0, likes: 0, lvl: 0, orderLvl: 0, orderLikes: 0, term: 0, lb: 0, ub: 999 },
        commands: {
            0: "profile:to profile",
            1: "levels:to levels",
            2: "cmts:to acc cmts",
            3: "history:to cmt history",
            4: "progress <%stat%>:stat progression",
            5: "hacks:to hack record",
            999: "settings:to settings"
        }
    };

    const botMsg = await msg.raw.channel.send(localEmbed);

    gs.loadTabs(settings.sheets.controlPanel.link, {database: settings.sheets.controlPanel.tabs.data.id, oldData: settings.sheets.controlPanel.tabs.oldData.id, hackers: settings.sheets.controlPanel.tabs.hackers.id}, rows => {
        const {database, oldData, hackers} = rows;
        const databaseUsers = [];

        data.ul = data.user.startsWith("@") ? database.find(row => row.discord == null ? false : row.discord.split("*")[row.discord.split("*").length-1] === data.user.replace("@", "")) : null;
        data.ul = data.ul == null ? null : data.ul;
        data.user = data.ul == null ? data.user : data.ul.playerID == null ? "" : data.ul.playerID;

        function isError(desc, subDesc){
            localEmbed = new Discord.MessageEmbed()
                .setColor(settings.colorKey.error)
                .setDescription(`${woof.emote(emotes.ul.error)} ${desc}`);
            
            if (typeof subDesc === "string") localEmbed.addField(settings.lines.dashed, `\`\`\`${subDesc}\`\`\``);
            botMsg.edit(localEmbed);
        }

        if (data.user === ""){
            isError(`**You're not linked with an account**`, `Use the "link" command to link to an account listed on the Updated Leaderboard`);
            return;
        };
       
        let res = gd.playerToAccount(data.user, async res => {
            if (+res < 0){
                isError(`**${+res === -1 ? settings.texts.account : gd.settings.errors[-2]}**`);
            }else if (typeof res === "object"){
                data.user = res;
                data.display = Object.assign(data.display, JSON.parse(JSON.stringify(res)));
            
                let lvls = await gd.getGJLevels(data.display.playerID, {type: 5, count: settings.caps.profileLvls+1}),
                cmtsAcc = await gd.getCommentsAccount(data.display.accountID, {count: settings.caps.profileCmts+1}),
                cmtsLvls = await gd.getCommentsHistory(data.display.playerID, {count: settings.caps.profileCmts+1});

                if (!(lvls == null)){
                    data.lvls.data = Array.isArray(lvls.levels) ? lvls.levels : [];
                    data.lvls.analysis = lvls.stats == null ? {} : lvls.stats;
                };

                if (!(cmtsAcc == null)){
                    data.cmtsAcc.data = Array.isArray(cmtsAcc.messages) ? cmtsAcc.messages : data.cmtsAcc.data;
                    data.cmtsAcc.analysis = cmtsAcc.analysis == null ? data.cmtsAcc.analysis : cmtsAcc.analysis;
                };
                
                if (!(cmtsLvls == null)){
                    data.cmtsLvls.data = Array.isArray(cmtsLvls.messages) ? cmtsLvls.messages : data.cmtsLvls.data;
                    data.cmtsLvls.analysis = cmtsLvls.analysis == null ? data.cmtsLvls.analysis : cmtsLvls.analysis;
                };

                data.hacker = (Array.isArray(hackers) ? hackers : []).find(row => row.playerID === data.display.playerID);
                data.oldData = (Array.isArray(oldData) ? oldData : []).find(row => row.accountID === data.display.accountID);
                
                if (!(data.hacker == null)){
                    data.display.hacker = data.hacker.toggle == null ? 1 : data.hacker.toggle.toLowerCase() === 'true' ? 0 : data.hacker.type == null ? 1 : data.hacker.type.toLowerCase().includes("note") ? 0 : 1;
                    data.hacker.pastnames = data.hacker.pastnames == null ? [] : data.hacker.pastnames.split(";").filter(item => typeof item === 'string' ? item.toLowerCase() === 'n/a' ? false : item.toLowerCase() === '_' ? false : item.toLowerCase().length >= 3 : false);
                    if (!(data.display.username === data.hacker.lastrecordedname)){
                        data.hacker.pastnames.unshift(`${data.display.username}:${Date.now()}`);
                        data.hacker.lastrecordedname = data.display.username;
                    };
                    data.hacker.accountID = data.display.accountID;
                    data.hacker.playerID = data.display.playerID;
                    data.hacker.pastnames = data.hacker.pastnames.length === 0 ? "_" : data.hacker.pastnames.join(";");
                    data.hacker.save();
                };

                data.ul = data.ul == null ? database.find(row => row.accountID == null || !(+row.accountID > 0) ? false : row.accountID === data.display.accountID) : data.ul;

                function saveRefresh(statsNew, statsOld) {
                    if (statsNew == null || data.ul == null) return;
                    let saveData = {};
                    
                    Object.keys(new ul.packets.statObject(statsNew)).map(key => {
                        saveData[key] = (+statsNew[key] > gd.settings.stats.caps[key] || +statsOld[key] > gd.settings.stats.caps[key]) ? +statsNew[key] > +statsOld[key] ? statsNew[key] : statsOld[key] : statsNew[key];
                    });
                    
                    statsOld.username = data.ul.username;
                    statsOld.mod = data.ul.mod;
                    
                    let achievements = ul.achievements.check(statsOld, statsNew);
                    data.ul.refreshPrevious = `${Date.now()}:${Object.values(new ul.packets.statObject(saveData)).join("|")}`;
                    
                    if (data.ul.locked == null ? false : data.ul.locked.toLowerCase() === 'true') return;
                    if (achievements.length > 0) refreshes.sendStatNotifications(null, achievements);
                }

                if (!(data.ul == null)){
                    data.display.ul = 1;
                    data.display.sg = data.ul.sg == null ? data.display.sg : data.ul.sg.toLowerCase() === "true" ? 1 : data.display.sg;
                    data.display.setBan = data.ul.setBan == null ? data.display.setBan : data.ul.setBan.toLowerCase() === "true" ? 1 : data.display.setBan;
                    data.user = data.ul.playerID == null ? data.user : data.ul.playerID;
                    data.display.color = data.ul.pcolor == null ? null : data.ul.pcolor.length > 0 ? JSON.parse(JSON.stringify(data.ul.pcolor)) : null;
                    data.display.diamonds = +data.display.diamonds === gd.settings.stats.caps.diamonds && +data.ul.diamonds > gd.settings.stats.caps.diamonds ? JSON.parse(JSON.stringify(data.ul.diamonds)) : data.display.diamonds;
                    data.display.gamemode = woof.lookupGamemode(data.ul.gamemode, 1);
                    data.display.disID = data.ul.discord == null ? null : JSON.parse(JSON.stringify(data.ul.discord)).split("*");
                    if (Array.isArray(data.display.disID) ? data.display.disID[data.ul.discord.split("*").length-1] === msg.disID : false) data.display.disID = [msg.disTag, msg.disID];
                    data.display.tag = data.display.disID == null ? null : data.display.disID.slice(0, data.ul.discord.split("*").length-1).join("*");
                    data.display.disID = data.display.disID == null ? null : +data.display.disID[data.ul.discord.split("*").length-1] > 0 ? data.display.disID[data.ul.discord.split("*").length-1] : null;
                    data.display.server = data.ul.server == null ? null : data.ul.server.length > 0 ? data.ul.server : null;
                    
                    data.display.lockedFrom = Object.values(woof.banFrom(data.ul.banFrom));
                    if (data.display.lockedFrom.some(item => item > 0)) data.display.lockedFrom.push(1);
                    if (data.ul.locked == null ? false : data.ul.locked.toLowerCase() === "true") data.display.locked = 1;

                    ["region", "country", "state", "gamemode", "bio", "bgprog", "pastUsernames", "instagram", "github"].map(key => {
                        data.display[key] = data.ul[key] == null ? null : JSON.parse(JSON.stringify(data.ul[key]));
                    });
        
                    data.display.pastUsernames = Array.isArray(data.display.pastUsernames) ? data.display.pastUsernames : typeof data.display.pastUsernames === "string" ? data.display.pastUsernames.split(",") : [];
                    data.display.pastUsernames = data.display.pastUsernames.filter(item => typeof item === "string" ? item.toLowerCase() === "N/A" ? false : item.toLowerCase() === "" ? false : item.toLowerCase() === "_" ? false : true : false);
                    if (data.display.pastUsernames.find(item => item === data.display.username) == null) data.display.pastUsernames.unshift(data.display.username);
                    data.ul.pastUsernames = data.display.pastUsernames.length > 0 ? data.display.pastUsernames.join(",") : "_";

                    Object.keys(settings.statKeys).slice(0, 6).map(key => {
                        data.ul[key] = data.display[key];
                    });
                    
                    saveRefresh(data.display, new ul.packets.statObject(data.ul.refreshPrevious == null ? null : data.ul.refreshPrevious.includes("|") ? data.ul.refreshPrevious.split(":")[1].split("|") : null, 0, 0, 1));
                    data.ul.username = data.display.username;
                    data.ul.save();
                    database.map(localUser => {
                        if (localUser.accountID == null || localUser.accountID === data.display.accountID) return;
                        if (localUser.locked == null ? false : localUser.locked.toLowerCase() === "true") return;
                        if (Object.keys(settings.statKeys).slice(0, 6).some(key => localUser[key] == null || isNaN(Number(localUser[key])))) return;
                        databaseUsers.push(Object.assign({accountID: localUser.accountID, banFrom: woof.banFrom(localUser.banFrom)}, woof.statsObject(localUser, 1)));
                    })
                };

                let filler = {
                    stars: [],
                    diamonds: [],
                    scoins: [],
                    ucoins: [],
                    demons: [],
                    cp: [],
                    net: []
                }, fillerKeys = Object.keys(filler);

                if (!(data.oldData == null)){
                    if (!(data.oldData.datapile == null)){
                        data.oldData.datapile.split("/").map((item, itemIndex) => {
                            if (typeof item === "string" ? item.includes("|") ? item.includes("-") ? 1 : 0 : 1 : 1) return;
                            item.split("|").map((key, i) => {
                                if (!(Array.isArray(filler[fillerKeys[i]]))) return;
                                filler[fillerKeys[i]].push(key);
                                if (filler.net[itemIndex] == null) filler.net[itemIndex] = [];
                                filler.net[itemIndex].push(key);
                            })
                            filler.net[itemIndex] = woof.netScore(woof.statsObject(filler.net[itemIndex], 1));
                        })
                    };
                };

                data.oldData = filler;

                data.display.settings = woof.settingsCheck(msg.level, msg.disID, data.display.disID, data.display.locked);
                data.settings.ub = filler.stars.length+1;
                data.settings.lb = filler.stars.length-7+1 > 0 ? filler.stars.length-7+1 : 0;
        
                data.display.pastUsernames = Array.isArray(data.display.pastUsernames) ? data.display.pastUsernames : typeof data.display.pastUsernames === "string" ? data.display.pastUsernames.split(",") : [];

                data.display.pastUsernames = data.display.pastUsernames.filter(item => typeof item === "string" ? item.toLowerCase() === "N/A" ? false : item.toLowerCase() === "" ? false : item.toLowerCase() === "_" ? false : true : false);

                Object.keys(data).map(key => {
                    data[key] = data[key] == null ? null : data[key];
                });

                function loadPage(page, localPage, color, isSave, imageFailure){
                    foundUser = botDataUsers.find(user => user[26] === data.display.accountID && +data.display.accountID > 0);
                    page = typeof page === 'number' ? page : typeof msg.page === 'number' ? msg.page : 0;
                    localPage = typeof localPage === 'number' ? localPage : typeof msg.localPage === 'number' ? msg.localPage : 0;
                    data.display.bio = typeof data.display.bio === "string" ? woof.replaceAdvanced(data.display.bio, "`", "") : "";
                    data.display.bio = typeof data.display.bio === "string" ? data.display.bio.length > 0 ? data.display.bio === "_" ? null : data.display.bio : null : null;
                    data.display.lvls = data.lvls.data.length;
                    data.display.cmts = data.cmtsLvls.data.length;
                    data.display.net = woof.netScore(data.display, 1);
                    data.display.owner = msg.raw.guild == null ? 0 : msg.raw.guild.ownerID === data.display.disID && +data.display.disID > 0 ? 1 : 0;
                    data.display.area = woof.lookupCountry(data.display.country);

                    if (!(foundUser === undefined)) data.display.helper = +foundUser[4] >= settings.levels.Helper ? +foundUser[4]-settings.levels.Helper+1 : 0;

                    function searchDisplay(showDate, showLikes, showTerm, showLevels) {
                        let items = [
                            [showDate, "date:<asc/desc/*empty*>|order"],
                            [showLikes, "likes:<asc/desc/*empty*>|order:<all/likes/dislikes>|filter"],
                            [showLevels, "lvl:<asc/desc/*empty*>|order:<#>|filter (0 to remove)"],
                            [showTerm, "term:<input>"]
                        ];
                        return items.map(key => {
                            if (!key[0]) return;

                            key = key[1].split(":");
                            let keyOptions = key.slice(1);

                            return `**${key[0]}:**\n${keyOptions.map(param => {
                                param = param.split("|");
                                param = `\`${param[0]}\`${typeof param[1] != 'string' ? '' : ` *- ${param[1]}*`}`;
                                return `${woof.emote(emotes.ul.blank)}${settings.characters.bulletPoint} ${param}`;
                            }).join("\n")}`;
                        }).filter(item => item != null).join("\n\n")+'\n\n*input "none" to remove changed settings*';
                    }

                    function commandDisplay() {
                        return Object.keys(data.commands).map(key => {
                            if (isNaN(+key) || !(typeof data.commands[key] === 'string') || +key === +page) return;
                            if ((+key === 5 && !data.display.hacker) || (+key === 999 && !(data.display.settings > 0)) || (+key === 4 && data.ul == null)) return;
                            key = JSON.parse(JSON.stringify(data.commands[key])).split(":");
                            return `\`${key[0]}\`${key.length > 1 ? ` *- ${key[1]}*` : ``}`;
                        }).filter(item => typeof item === 'string');
                    }

                    function getRanks(){
                        let returnValue = [];

                        if (!(data.ul == null) && !data.display.locked) {
                            returnValue.push(...Object.keys(settings.statKeys).slice(0, 6).map(key => {
                                if (data.display.lockedFrom[key]) return 0;
                                let localBin = JSON.parse(JSON.stringify(databaseUsers));
                                localBin.push(data.display);
                                return localBin.filter(user => !(+user.banFrom[key] > 0)).sort((a, b) => Number(b.accountID)-Number(a.accountID)).sort((a, b) => Number(b[key])-Number(a[key])).findIndex(item => item.accountID === data.display.accountID)+1;
                            }));

                            if (Object.values(data.display.lockedFrom).some(item => +item > 0)){
                                returnValue.push(0);
                            }else{
                                let localBin = JSON.parse(JSON.stringify(databaseUsers));
                                localBin.push(data.display);
                                returnValue.push(localBin.filter(user => !(Object.values(user.banFrom).some(item => +item > 0))).sort((a, b) => Number(b.accountID)-Number(a.accountID)).sort((a, b) => Number(b.net)-Number(a.net)).findIndex(item => item.accountID === data.display.accountID)+1);
                            };
                        };

                        return returnValue;
                    }

                    let isErrorValue = 0, userBadges = ["mod", ...Object.keys(settings.statKeys)].map(key => {
                        let collection = emotes.badges[key];
                        if (!(Array.isArray(collection))) return;
                        collection = JSON.parse(JSON.stringify(collection)).sort((a, b) => b[0] - a[0]);
                        collection = collection.find(item => +data.display[key] >= item[0]);
                        return Array.isArray(collection) ? localPage%2 === 1 && page === 0 ? `${woof.emote(collection[1])} \`${key === "mod" ? +collection[0] === 2 ? 'Elder' : 'Regular' : collection[0]} ${key}\`` : woof.emote(collection[1], 0, `${key}_${collection[0]}`) : 0;
                    }).filter(item => typeof item === "string"),
                        userRanks = getRanks(),
                        userStats = woof.statsDisplay(data.display, Object.keys(settings.statKeys), emotes.stats, 7, 0, 0, data.display.lockedFrom, userRanks),
                        userMedias = woof.mediaDisplay(data.display, ["owner", "cmts", "lvls", "tag", "youtube", "twitter", "twitch", "instagram", "github", "server", "area"], data.display.locked || data.display.setBan ? 1 : 0),
                        userTitles = woof.titleDisplay(data.display.locked || data.display.setBan ? 1 : 0, data.display.helper, data.display.ul, data.display.sg, data.display.hacker);

                    function errorProgression(title, desc){
                        isErrorValue = 1;
                        localEmbed.setDescription(`${woof.emote(emotes.ul.error)} **${title}**`);

                        if (typeof desc === "string") localEmbed.addField(settings.lines.dashed, desc);
                        localEmbed.addField(`_\n_**__Commands__**`, commandDisplay().join("\n"));
                        botMsg.edit(localEmbed);
                    };

                    localEmbed = new Discord.MessageEmbed().setColor(data.display.locked || data.display.setBan ? null : woof.colorCheck(color).res > 0 ? woof.colorCheck(color).hex : woof.colorCheck(data.display.color).res > 0 && !(page === 999) ? woof.colorCheck(data.display.color).hex : null);

                    if (page === 0){

                        woof.embedPlayerDefault(localEmbed, data.display, `${woof.possession(data.display.username)} Profile`, data.display.gamemode);

                        localEmbed
                            .setDescription([typeof data.display.bio === "string" ? woof.settingsChangeDefault(data.display.bio) === "_" || data.display.setBan || data.display.locked ? null : `\`\`\`${data.display.bio.substr(0, settings.caps.bio)}${data.display.bio.length > settings.caps.bio ? `...` : ``}\`\`\`` : null, userStats.length > 0 ? userStats.join("\n") : null, userMedias.length > 0 ? `\n${userMedias.join("\n")}` : null].filter(item => !(item == null)).join("\n"))
                            .addField(`Collectable Badges _(Page ${localPage%2 === 0 ? 1 : 2}/2)_`, `${userBadges.length === 0 ? `_${settings.texts.empty}_` : userBadges.join(localPage%2 === 1 ? "\n" : " ")}${msg.commands ? `\n${settings.characters.spaces}` : `\n\n*Type "\`commands\`" to display subcommands*`}`);
                            
                        if (msg.commands) localEmbed.addField(`*Type "\`commands\`" to hide subcommands*`, commandDisplay());

                        if (userTitles.length > 0) localEmbed.setTitle(userTitles.join(" "));
                    }else if (page === 1){
                        let lvlsText = woof.levelsDisplay(woof.levelFilter(JSON.parse(JSON.stringify(data.lvls.data)).slice(0, settings.caps.profileLvls), 0, localPage, data.settings.lvl, data.settings.orderLvl, data.settings.orderLikes, data.settings.likes, data.settings.term));
                        woof.embedPlayerDefault(localEmbed, data.display, `${woof.possession(data.display.username)} Levels`, data.display.gamemode);
                        
                        localEmbed
                            .setTitle(`:bar_chart: Statistics (All Lvls)\n${woof.emote(emotes.stats.stars)} \`${data.lvls.analysis.stars}\`  ${woof.emote(emotes.levels.downloads)} \`${data.lvls.analysis.downloads}\`  ${woof.emote(woof.likes(data.lvls.analysis.likes))} \`${data.lvls.analysis.likes}\`  ${woof.emote(emotes.levels.ucoins)} \`${data.lvls.analysis.ucoinsVerified}\`  ${woof.emote(emotes.levels.unverifiedUcoins)} \`${data.lvls.analysis.ucoinsUnverified}\`\n_\n_`)
                            .setDescription(lvlsText.length > 0 ? `${lvlsText}\n_\n_` : `*${settings.texts.empty}*\n_\n_`)
                            .addField(`${woof.emote(emotes.ul.settings)} __**Settings**__`, `${woof.messageFilterDisplay(localPage, null, data.settings.lvl, data.settings.orderLvl, data.settings.orderLikes, data.settings.likes, data.settings.term)}${msg.commands ? `\n${settings.characters.spaces}` : `\n\n*Type "\`commands\`" to display subcommands*`}`);

                        if (msg.commands) localEmbed.addField(`*Type "\`commands\`" to hide subcommands*`, `${commandDisplay().join("\n")}\n\n${searchDisplay(1, 1, 1, 1)}`);
                    }else if (page === 2){
                        let msgText = woof.messagesDisplay(woof.messageFilter(JSON.parse(JSON.stringify(data.cmtsAcc.data)).slice(0, settings.caps.profileCmts), 0, localPage, data.settings.date, data.settings.lvl, data.settings.orderLvl, data.settings.orderLikes, data.settings.likes, data.settings.term));
                        woof.embedPlayerDefault(localEmbed, data.display, `${woof.possession(data.display.username)} Cmts Account`, data.display.gamemode);
                        
                        localEmbed
                            .setTitle(`:bar_chart: Statistics (All Msgs)\n${woof.emote(woof.likes(data.cmtsAcc.analysis.likes))} \`${data.cmtsAcc.analysis.likes}\`\n_\n_`)
                            .setDescription(msgText.length > 0 ? `${msgText}\n_\n_`  : `*${settings.texts.empty}*\n_\n_`)
                            .addField(`${woof.emote(emotes.ul.settings)} __**Settings**__`, `${woof.messageFilterDisplay(localPage, data.settings.date, null, null, data.settings.orderLikes, data.settings.likes, data.settings.term)}${msg.commands ? `\n${settings.characters.spaces}` : `\n\n*Type "\`commands\`" to display subcommands*`}`);
                        
                        if (msg.commands) localEmbed.addField(`*Type "\`commands\`" to hide subcommands*`, `${commandDisplay().join("\n")}\n\n${searchDisplay(1, 1, 1, 0)}`);
                    }else if (page === 3){
                        woof.embedPlayerDefault(localEmbed, data.display, `${woof.possession(data.display.username)} Cmts Levels`, data.display.gamemode);
                        if (+data.display.comments > 0 && !(data.display.settings > 0) && !(data.display.settings === 1 && (data.display.setBan || data.display.locked ? 1 : 0))) errorProgression(settings.texts.permission);
                        if (isErrorValue) return;
                        
                        let msgText = woof.messagesDisplay(woof.messageFilter(JSON.parse(JSON.stringify(data.cmtsLvls.data)).slice(0, settings.caps.profileCmts), 0, localPage, data.settings.date, data.settings.lvl, data.settings.orderLvl, data.settings.orderLikes, data.settings.likes, data.settings.term));
                        
                        localEmbed
                            .setTitle(`:bar_chart: Statistics (All Msgs)\n${woof.emote(woof.likes(data.cmtsLvls.analysis.likes))} \`${data.cmtsLvls.analysis.likes}\` ${woof.emote(emotes.levels.icon)} \`${data.cmtsLvls.analysis.levels}\`\n_\n_`)
                            .setDescription(msgText.length > 0 ? `${msgText}\n_\n_` : `*${settings.texts.empty}*\n_\n_`)
                            .addField(`${woof.emote(emotes.ul.settings)} __**Settings**__`, `${woof.messageFilterDisplay(localPage, data.settings.date, data.settings.lvl, data.settings.orderLvl, data.settings.orderLikes, data.settings.likes, data.settings.term)}${msg.commands ? `\n${settings.characters.spaces}` : `\n\n*Type "\`commands\`" to display subcommands*`}`);
                        
                        if (msg.commands) localEmbed.addField(`*Type "\`commands\`" to hide subcommands*`, `${commandDisplay().join("\n")}\n\n${searchDisplay(1, 1, 1, 1)}`);
                    }else if (page === 4){
                        woof.embedPlayerDefault(localEmbed, data.display, `${woof.possession(data.display.username)} Progression`, data.display.gamemode);
                        let useData = JSON.parse(JSON.stringify(data.oldData[data.settings.stat]));
                        useData.unshift(data.display[data.settings.stat]);
                        let useNames = useData.map((v, i) => {
                            return i === 0 ? `Current` : `${i}w ago`;
                        }).reverse();
                        ["lb", "ub"].map(key => {
                            data.settings[key] = isNaN(Number(data.settings[key])) ? key === "ub" ? 999 : 0 : Number(data.settings[key]);
                        });

                        if (data.display.locked || data.ul == null || data.oldData == null){
                            errorProgression(settings.texts.onULNot);
                        }else{
                            localEmbed.setTitle(`${woof.emote(emotes.stats[data.settings.stat])} \`${settings.statKeys[data.settings.stat][0]} Progression\``);
                            
                            if (useData == null ? true : useData.length <= 1){
                                errorProgression(`Data unavailable`, `\`\`\`${settings.texts.dataAvailable}\`\`\``);
                            }else if (useData.slice(data.settings.lb, data.settings.ub).length === 0){
                                errorProgression(`Data out of bounds`, `> **Data Length:** \`${useData.length}\`\n> **Lower bound (lb):** \`${data.settings.lb}\`\n> **Upper bound (ub):** \`${data.settings.ub}\``);
                            }else{
                                localEmbed.setDescription(`${msg.commands ? `Type "\`commands\` to hide subcommands\n${Object.keys(settings.statKeys).map(item => {return `\`${item}\``}).join(" ")}\n\n\`lb #\` - sets lower bound\n\`ub #\` - sets upper bound\n${msg.commandsDirection()}\n\n${commandDisplay().join("\n")}\n` : 'Type "\`commands\` to display subcommands'}\n\n:bar_chart: __Statistics__\n${woof.statisticsDisplay(useData.reverse())}\n${settings.characters.spaces}`);
                                let rawEmbed = new Discord.MessageEmbed(JSON.parse(JSON.stringify(localEmbed)));
                                localEmbed.addField(settings.characters.spaces, `> **Lower Bound:** \`${data.settings.lb}\` **Upper Bound:** \`${data.settings.ub}\`\n> **Page:** \`${localPage+1} of 2\`\n\n${woof.loadingMsg(1, `*`)}`);
                                botMsg.edit(localEmbed);
                                

                                woof.loadChart(useData, useNames, data.settings.lb, data.settings.ub, localPage, data.display.setBan ? 0 : data.display.bgprog, typeof data.display.color === "string" && !data.display.setBan ? settings.colorKey[data.display.color] == null ? data.display.color : settings.colorKey[data.display.color] : null, Object.keys(settings.statKeys).findIndex(item => item === data.settings.stat), async graph => {
                                    if (graph == null) return;

                                    let discordThing = await client.channels.fetch("637430108428304404");
                                    if (discordThing == null) return;

                                    discordThing.send(new Discord.MessageAttachment(`./${graph}`)).then(newMsg => {
                                        if (newMsg == null) return;
                                        if (newMsg.attachments == null) return;
                                        if (newMsg.attachments.first() == null) return;
                                        rawEmbed.setImage(newMsg.attachments.first().proxyURL);
                                        rawEmbed.addField(settings.characters.spaces, `> **Lower Bound:** \`${data.settings.lb}\` **Upper Bound:** \`${data.settings.ub}\`\n> **Page:** \`${localPage+1} of 2\`\n\n*${settings.texts.dataRefresh}*`);
                                        botMsg.edit(rawEmbed);
                                    });
                                })
                            };
                        };
                    }else if (page === 5){
                        woof.embedPlayerDefault(localEmbed, data.display, `${woof.possession(data.display.username)} Hacking Record`, data.display.gamemode);
                        if (!(+data.display.hacker > 0) || data.hacker == null) errorProgression(settings.texts.hlNotAvailable);
                        if (isErrorValue) return;

                        let usernames = (typeof data.hacker.pastnames === 'string' ? data.hacker.pastnames : ``).split(";").filter(item => typeof item === "string" ? item.toLowerCase() === "N/A" ? false : item.toLowerCase() === "" ? false : item.toLowerCase() === "_" ? false : true : false).map(item => {
                            return `\`${item.split(":")[0]}\``;
                        }).join(`, ${settings.characters.spaces} `),
                            evidenceList = [],
                            evidences = (typeof data.hacker.evidence === 'string' ? data.hacker.evidence.split(";") : ``).filter(item => typeof item === 'string' ? item.includes(",") : false).map((item, i) => {
                                item = item.split(",");
                                if (item.some(item => item == null)) return;
                                if (item.some(item => item.length < 1)) return;
                                item[0] = item[0].endsWith(")") ? item[0].substr(0, item[0].length-1) : item[0];
                                item[0] = item[0].startsWith("(") ? item[0].substr(1, item[0].length) : item[0];
                                evidenceList.push(item[1]);
                                return `${settings.characters.bulletPoint} [${item[0]}](${item[1]})${item[1].toLowerCase().includes("/youtu") ? ` ${woof.emote(emotes.media.youtube)}` : ``}`;
                            }).filter(item => typeof item === 'string'),
                            likelyUsedHacks = Object.keys(settings.hacksKey).map(key => {
                                if (typeof data.hacker[key] === 'string' ? data.hacker[key].toLowerCase() === 'true' || data.hacker[key] === woof.bool(1, 4) ? false : true : true) return;
                                return `\`${settings.hacksKey[key][0]}\``;
                            }).filter(item => typeof item === 'string').join(`, ${settings.characters.spaces} `);
                        
                        while (msg.localPage > evidenceList.length+1) msg.localPage = msg.localPage-evidenceList.length;
                        msg.localPage = msg.localPage === 0 ? evidenceList.length : msg.localPage > evidenceList.length ? 1 : msg.localPage;
                        localPage = msg.localPage >= evidenceList.length ? 0 : msg.localPage;
                        evidences[localPage] = `${evidences[localPage]} ${settings.characters.spaces} :arrow_left:`;

                        let msgText = data.hacker.description == null ? `` : data.hacker.description.length > 1 ? `\`\`\`${data.hacker.description}\`\`\`\n` : ``;
                        msgText += [data.hacker.ugdb == null ? null : data.hacker.ugdb.toLowerCase() === "true" ? `${woof.emote(emotes.ul.ugdb)} [Banned from UltimateGDBot's leaderboard](${settings.links.ugdbInvite})` : null, msg.commands ? `'Type "\`commands\`" to display subcommands'\n${msg.commandsDirection(0, "> ")}\n${commandDisplay().map(item => {return `> ${item}`}).join("\n")}` : 'Type "`commands`" to display subcommands'].filter(item => typeof item === 'string').map(item => {return `> ${item}`}).join("\n")+"\n\n";
                        msgText += `__**Past Usernames**__\n${usernames.length > 0 ? usernames : `*${settings.texts.empty}*`}\n\n`;
                        msgText += `__**(Likely) Used Hacks**__\n${likelyUsedHacks.length > 0 ? likelyUsedHacks : `*${settings.texts.empty}*`}\n_\n_`;
                        msgText += `📂 __**Evidence**__\n${evidences.length > 0 ? evidences.join("\n") : `*${settings.texts.empty}*`}`;

                        localEmbed
                            .setTitle([typeof data.hacker.dateadded === 'string' ? data.hacker.dateadded.length > 0 ? `**Date Added:** \`${woof.dates(data.hacker.dateadded.split("/")[0], data.hacker.dateadded.split("/")[1], data.hacker.dateadded.split("/")[2])}\`` : null : null, typeof data.hacker.type === 'string' ? data.hacker.type.length > 0 ? `**Hacker Type:** \`${data.hacker.type}\`` : null : null, typeof data.hacker.addedby === 'string' ? data.hacker.addedby.length > 0 ? `**Added by:** \`${data.hacker.addedby}\`` : null : null].filter(item => typeof item === "string").join("\n")+"\n_\n_")
                            .setDescription(msgText.length > 0 ? `${msgText}\n_\n_`  : `*${settings.texts.empty}*\n_\n_`);
                            
                        if (typeof evidenceList[localPage] === "string"){
                            if (evidenceList[localPage].toLowerCase().startsWith("http") && settings.acceptableImageFiles.some(item => evidenceList[localPage].toLowerCase().endsWith(`.${item}`))) localEmbed.setImage(evidenceList[localPage]);
                        };
                    }else if (page === 999){
                        woof.embedPlayerDefault(localEmbed, data.display, `${woof.possession(data.display.username)} Settings`, data.display.gamemode);
                        
                        if (!(data.display.settings > 0)) errorProgression(settings.texts.permission);
                        if (isErrorValue) return;

                        let desc = `${`Type "\`commands\`" to ${msg.commands ? "hide" : "display"} subcommands\n${msg.commands ? `${commandDisplay().join("\n")}\n` : ``}\n`}*Directions*\`\`\`TO CHANGE A VALUE:\nType "<bolded_name> <new value>"\n\nTO SAVE CHANGES:\nType "save"\`\`\``;

                        switch (localPage) {
                            case 0:
                                desc += `\n> **It's expected you don't abuse these settings.** Feel free to do something stupid, but that doesn't mean you have permission to...`;
                                desc += `\n\n${data.display.setBan ? `${woof.emote(emotes.stats.lock)} ` : ``}**Bio:** ${data.display.bio == null ? `_none_` : `\`${data.display.bio.length > 200 ? `${data.display.bio.split("").slice(0, 197).join("")}...` : data.display.bio}\` _(${data.display.bio.length}/${settings.caps.bio})_\n_Input "none" to remove_`}`;
                                desc += `\n\n**Icon:** \`${woof.lookupGamemode(data.display.gamemode)}\`\n\*_Types: ${gd.settings.gamemodes.join(", ")}_`;
                                desc += `\n\n${data.display.setBan ? `${woof.emote(emotes.stats.lock)} ` : ``}${woof.emote(emotes.media.instagram)} **IG:** ${woof.settingsChangeDefault(data.display.instagram, `_none_`, `\``)}`;
                                desc += `\n${data.display.setBan ? `${woof.emote(emotes.stats.lock)} ` : ``}${woof.emote(emotes.media.github)} **Github:** ${woof.settingsChangeDefault(data.display.github, `_none_`, `\``)}`;
                                desc += `\n${data.display.setBan ? `${woof.emote(emotes.stats.lock)} ` : ``}${woof.emote(emotes.media.discord)} **Server:** ${woof.settingsChangeDefault(data.display.server, `_none_`, `\``)}\n\*_Input "none" to remove_\n_\n_`;
                                localEmbed.addField(`${data.display.area == null ? `` : data.display.area.icon == null ? `` : `${data.display.area.icon} `} **__Location__**`, `**Region:** ${woof.settingsChangeDefault(data.display.region, `_none_`, `\``)}\n**Country:** ${data.display.area == null ? `_none_` : data.display.area.country == null ? `_none_` : `\`${Array.isArray(data.display.area.country) ? data.display.area.country[0] : data.display.area.country}\``}\n**State:** ${woof.settingsChangeDefault(data.display.state, `_none_`, `\``)}\n\*_Input "none" to remove_\n_\n_`);
                                break;
                            case 1:
                                let presetBinStop = Object.keys(settings.colorKey).findIndex(item => item === "8=8"),
                                presetBinDesc = ``;

                                Object.keys(settings.colorKey).map((key, i) => {
                                    if (i === presetBinStop) presetBinDesc += `\n\n_Special Presets_\n`;
                                    presetBinDesc += `\`${key}\`${i+1 === presetBinStop || i+1 === Object.keys(settings.colorKey).length ? `` : `,  `}`;
                                });
                                
                                desc += `\n\n**Color:** ${woof.colorCheck(data.display.color).res > 0 ? `\`${data.display.color} [${woof.colorCheck(data.display.color).rgb.join(",")}]\`` : `_none_`}\n\*_Input hex code OR: "# # #"_\n\*input "none" to remove`;
                                desc += `\n\n__**Preset Colors:**__\n`+presetBinDesc;
                                break;
                            case 2:
                                desc += `\n\n**BGProg:** ${+data.display.bgprog > 0 ? `\`${woof.bgprogCheck(data.display.bgprog, 1)}\`` : woof.bgprogCheck(data.display.bgprog) === 3 ? `\`${woof.bgprogCheck(data.display.bgprog, 1)}\`` : `_none_`}\n\*_Types: none, sg, cp, <attach image>_\n\*_Ideal size: ${settings.chart.size[0]-2*settings.chart.borderWidth}x${settings.chart.size[1]-2*settings.chart.borderWidth-settings.chart.barTop-settings.chart.barBottom} (subject to change)_\n\n__**Custom Chart Guidelines**__\n${settings.bgprogGuidelines.map(item => {return `> ${settings.characters.bulletPoint} ${item}`}).join("\n")}\n_\n_`;
                                localEmbed.setImage(woof.bgprogCheck(data.display.bgprog) === 3 ? data.display.bgprog : settings.images[`chart${["UL", "SG", "CP"][woof.bgprogCheck(data.display.bgprog)]}`]);
                                break;
                            case 3:
                                let moderationShow = [`**SG:** ${woof.emote(woof.bool(data.display.sg, 3))}`];
                                
                                if (msg.level >= settings.levels.Officer) moderationShow.unshift(`**Locked:** ${woof.emote(woof.bool(data.display.locked, 3))}`, `**setBan:** ${woof.emote(woof.bool(data.display.setBan, 3))}`);
                                if (msg.level >= settings.levels.Helper) desc += `\n\n${woof.emote(msg.level >= settings.levels.Officer ? emotes.badges.helpers[1] : emotes.badges.helpers[0])} __**Moderation**__${moderationShow.length > 0 ? `\n${moderationShow.join(" ")}` : ``}`;
                                if (msg.level >= settings.levels.Special) desc += `\n\n:sparkles: __**Specialties**__\n${data.display.setBan ? `${woof.emote(emotes.stats.lock)} ` : ``}**Diamonds:** \`${data.display.diamonds}\``;
                                
                                break;
                        }

                        localEmbed
                            .setTitle(`**Page:** \`${localPage+1} of ${data.display.settings >= 2 ? 4 : 3}\``)
                            .setDescription(desc);
                            
                        if (imageFailure) localEmbed.setFooter("INVALID FILE", woof.emote(emotes.ul.warning, 0, 0, 1)); 
                        if (isSave) localEmbed.setFooter("SAVED", woof.emote(emotes.ul.valid, 0, 0, 1));
                        botMsg.edit(localEmbed);
                    };

                    if (!(page === 4) && !(isErrorValue)) botMsg.edit(localEmbed);
                };
                
                loadPage(msg.page, msg.localPage);

                msg.awaitMessages(900000, 1, 1, (newMsg, reload) => {
                    let oldPage = JSON.parse(JSON.stringify(msg.page)), oldLocalPage = JSON.parse(JSON.stringify(msg.localPage)),
                    newMsgData = {
                        callerMap: [[["profile", "user"], 0], [["levels", "lvls"], 1, 0], [["cmts", "comments"], 2, 0], [["history", "cmtslvls", "cmts lvls", "comments levels"], 3, 0], [["progress", "prog"], 4, 0], [["hacks", "hack", "hacker", "hack record", "hack records", "records", "hax"], 5, 0], [["settings", "ul", "helpers", "helper"], 999, 0]].find(item => item[0].find(item => newMsg.content.toLowerCase().startsWith(item))),
                    };

                    if (Object.keys(settings.statKeys).map(key => settings.statKeys[key]).some(item => item.find(item => item.toLowerCase() === newMsg.content.toLowerCase()))){
                        data.settings.stat = woof.lookupStat(newMsg.content, "stars");
                        msg.page = 4;
                        reload = 1;
                    }else if (!(newMsgData.callerMap == null)){
                        newMsgData.caller = newMsgData.callerMap[0].find(item => newMsg.content.toLowerCase().startsWith(item));
                        newMsgData.content = JSON.parse(JSON.stringify(newMsg.content)).substr(newMsgData.caller.length+1, newMsg.content.length);

                        msg.page = newMsgData.callerMap[1];
                        if (!(newMsgData.callerMap[2] == null) && !(msg.page === 4 && msg.localPage <= 1)) msg.localPage = newMsgData.callerMap[2];
                        reload = 1;

                        switch (msg.page) {
                            case 4:
                                if (newMsgData.content.length > 0) data.settings.stat = woof.lookupStat(newMsgData.content);
                                break;
                        }
                    }else{
                        let keys = JSON.parse(JSON.stringify(newMsg.content)).toLowerCase().split(" ");
                        
                        if (msg.page > 0 && msg.page < 4){
                            if (keys[0] === 'date') {
                                reload = 1;
                                msg.localPage = 0;
                                data.settings.date = woof.directionOrder(keys[1]);
                            }else if (keys[0] === 'likes') {
                                reload = 1;
                                msg.localPage = 0;
                                if (keys.length === 1 || keys[1] === 'none' || keys[1] === '_') {
                                    data.settings.likes = 0;
                                    data.settings.orderLikes = 0;
                                }else if (keys[1] === 'all' || keys[1] === 'likes' || keys[1] === 'dislikes'){
                                    data.settings.likes = keys[1] === 'dislikes' ? -1 : keys[1] === 'likes' ? 1 : 0;
                                }else if (!(data.settings.orderLikes === woof.directionOrder(keys[1]))){
                                    data.settings.orderLikes = woof.directionOrder(keys[1]);
                                }
                            }else if (keys[0] === 'lvl') {
                                reload = 1;
                                msg.localPage = 0;
                                if (keys.length === 1 || keys[1] === 'none' || keys[1] === '_') {
                                    data.settings.lvl = 0;
                                    data.settings.orderLvl = 0;
                                }else if (!isNaN(+keys[1])){
                                    data.settings.lvl = Number(keys[1]).toString();
                                }else if (!(data.settings.orderLvl === woof.directionOrder(keys[1]))){
                                    data.settings.orderLvl = woof.directionOrder(keys[1]);
                                }
                            }else if (keys[0] === 'term') {
                                reload = 1;
                                msg.localPage = 0;
                                data.settings.term = keys[1] === 'none' || keys[1] === '_' || keys.length <= 1 ? 0 : keys.slice(1, keys.length).join(" ").toString();
                            };
                        }else if (msg.page === 4){
                            if ((keys[0] === 'lb' || keys[0] === 'ub') && +keys[1] >= 0 && +keys[1] <= 999){
                                reload = 1;
                                data.settings[keys[0]] = Math.round(+keys[1]);
                            };
                        }else if (msg.page === 999 && data.display.settings > 0 && !(data.display.settings === 1 && (data.display.locked || data.display.setBan ? 1 : 0))){
                            if (data.display.settings > 1){
                                if (['locked', `sg`, `setban`].some(item => item === keys[0])){
                                    msg.localPage = 3;
                                    reload = 1;
                                    data.display[keys[0] === 'setban' ? 'setBan' : keys[0]] = woof.boolFlip(typeof keys[1] === 'string' ? keys[1] === 'true' ? 0 : 1 : data.display[keys[0] === 'setban' ? 'setBan' : keys[0]]);
                                }
                            };

                            if (msg.level >= settings.levels.Helper || (!(data.display.setBan) && msg.level >= settings.levels.Special && +data.user.diamonds >= gd.settings.stats.caps.diamonds)){
                                let findLocalKey = settings.statKeys.diamonds.find(item => keys.join(" ").startsWith(item.toLowerCase()+" "));
                                if (!(findLocalKey == null)){
                                    msg.localPage = 3;
                                    reload = 1;
                                    data.display.diamonds = Number(keys.join(" ").substr(findLocalKey.length+1, keys.join(" ").length)) > gd.settings.stats.caps.diamonds ? keys.join(" ").substr(findLocalKey.length+1, keys.join(" ").length) : gd.settings.stats.caps.diamonds;
                                }
                            };

                            if (['bgprog', 'chart', `graph`].some(item => item === keys[0])){
                                msg.localPage = 2;
                                reload = 1;

                                if (newMsg.attachments == null ? false : newMsg.attachments.first() == null ? false : newMsg.attachments.first().proxyURL == null ? false : newMsg.attachments.first().height == null ? false : newMsg.attachments.first().width == null ? false : true){
                                    let itemImage = newMsg.attachments.first().proxyURL;
                                    reload = 0;
                                    if (settings.acceptableImageFiles.find(item => item.toLowerCase() === itemImage.split(".")[itemImage.split(".").length-1].toLowerCase()) == null){
                                        reload = 0;
                                        loadPage(msg.page, msg.localPage, null, 0, 1);
                                    }else{
                                        itemImage = new Discord.MessageAttachment(itemImage);
                                        client.channels.fetch("637430108428304404").then(channel => {
                                            channel.send(itemImage).then(createdMsg => {
                                                actions.actions[7](client, msg, data.display, itemImage, 0);
                                                data.display.bgprog = createdMsg.attachments.first().proxyURL;
                                                loadPage(msg.page, msg.localPage);
                                            });
                                        }).catch(err => {console.log(err)});
                                    }
                                }else{
                                    data.display.bgprog = keys.length > 1 ? keys[1] === "sg" ? 0 : keys[1] === "creator" || keys[1] === "creator" || keys[1] === "cp" ? 1 : null : null;
                                }
                            }else if (['state', 'country', 'area', 'region'].some(item => item === keys[0])){
                                msg.localPage = 0;
                                reload = 1;
                                let localArea = woof.lookupArea(keys.slice(1, keys.length).join(" "));
                                if (localArea == null){
                                    data.display.area = null;
                                    data.display.region = "_";
                                    data.display.country = "_";
                                    data.display.state = "_";
                                }else if (typeof localArea === "string"){
                                    data.display.area = "_";
                                    data.display.region = localArea;
                                    data.display.country = "_";
                                    data.display.state = "_";
                                }else if (!(localArea.state == null)){
                                    data.display.area = localArea.country;
                                    data.display.region = localArea.region;
                                    data.display.country = Array.isArray(data.display.area.country) ? data.display.area.country[0] : data.display.area.country;
                                    data.display.state = Array.isArray(localArea.state) ? localArea.state[0] : localArea.state;
                                }else if (!(localArea.country == null)){
                                    data.display.area = localArea;
                                    data.display.region = localArea.region;
                                    data.display.country = Array.isArray(data.display.area.country) ? data.display.area.country[0] : data.display.area.country;
                                    data.display.state = "_";
                                };
                            }else if (['icon', 'gamemode', 'bio', 'instagram', 'ig', 'discord', 'code', 'server', 'github'].some(item => item === keys[0])){
                                if (data.display.settings > 1 ? true : data.display.setBan ? keys[0] === 'gamemode' || keys[0] === 'icon' ? true : false : true) {
                                    msg.localPage = 0;
                                    reload = 1;
                                    data.display[keys[0] === 'icon' ? 'gamemode' : keys[0] === 'ig' ? 'instagram' : keys[0] === 'code' || keys[0] === 'discord' ? 'server' : keys[0]] = keys[0] === 'icon' || keys[0] === 'gamemode' ? woof.lookupGamemode(keys.slice(1, keys.length).join(" ")) : woof.settingsChangeDefault(newMsg.content.split(" ").slice(1, keys.length).join(" "));
                                };
                            }else if (keys[0] === 'color'){
                                msg.localPage = 1;
                                reload = -1;
                                data.display.color = woof.colorCheck(keys.slice(1, 4)).output;
                                loadPage(msg.page, msg.localPage, woof.colorCheck(data.display.color).res > 0 ? data.display.color : null);
                            }else if (keys[0] === 'save' && !(data.ul == null)) {
                                let changes = [];
                                Object.keys(data.display).map(key => {
                                    try {
                                        if (!Object.keys(data.ul).some(item => item.toLowerCase() === key.toLowerCase())) return;
                                        let localKey = JSON.parse(JSON.stringify(data.display[key]));
                                        if (key === 'bgprog' && typeof data.ul[key] === 'string' && typeof data.display[key] === 'string') {
                                            if (data.display[key].startsWith("http") && data.ul[key] != data.display[key]) actions.actions[7](client, msg, data.display, data.display[key], 1);
                                        }
                                        localKey = key === 'banFrom' ? woof.banFrom(localKey, 1) : localKey;
                                        localKey = key === 'pastUsernames' ? Array.isArray(localKey) ? localKey.join(",") : typeof localKey === 'string' ? localKey : '_' : localKey;
                                        localKey = key === "sg" || key === "locked" || key === "setBan" ? +localKey > 0 ? "TRUE" : "FALSE" : localKey;
                                        localKey = key === "gamemode" ? localKey = woof.lookupGamemode(localKey) : localKey;

                                        if (!(key === "comments") && data.ul[key] != localKey && (typeof localKey === 'string' || typeof localKey === 'boolean')) changes.push([key, data.ul[key], localKey]);
                                        if (!(key === "comments")) data.ul[key] = typeof localKey === 'string' || typeof localKey === 'boolean' ? localKey : "_";
                                    } catch (err) {console.log(err)};
                                });
                                
                                data.ul.medias = [data.display.youtube, data.display.twitter, data.display.twitch].map(item => {return typeof item === "string" ? item.length > 0 ? item : "_" : "_"}).join("+");
                                if (data.ul.pcolor != woof.colorCheck(data.display.color).output) changes.push(`pcolor:${data.ul.pcolor}:${woof.colorCheck(data.display.color).output}`);
                                data.ul.pcolor = woof.colorCheck(data.display.color).output;
                                reload = 2;

                                saveRefresh(data.display, new ul.packets.statObject(data.ul.refreshPrevious == null ? null : data.ul.refreshPrevious.includes("|") ? data.ul.refreshPrevious.split(":")[1].split("|") : null, 0, 0, 1));
                                data.ul.save();

                                actions.actions[9](client, msg, data.display, changes, "saved");
                            };
                        };
                    };

                    if (!(oldPage === msg.page)) msg.localPage = 0;
                    if (msg.page === 4 && msg.localPage > 1) msg.localPage = 1;
                    if (+reload > 0 || !(oldPage === msg.page) || !(oldLocalPage === msg.localPage)){
                        if (!(reload === -1)) loadPage(msg.page, msg.localPage, 0, +reload === 2 ? 1 : 0);
                        newMsg.delete().catch(err => {});
                    };
                    if (+reload < 0) newMsg.delete().catch(err => {});
                });

                msg.awaitReactions(botMsg, 900000, 1, (newReact, user, reload) => {
                    let oldPage = JSON.parse(JSON.stringify(msg.page)), oldLocalPage = JSON.parse(JSON.stringify(msg.localPage));

                    if (newReact._emoji.name === "👤") msg.page = 0;
                    if (newReact._emoji.id === emotes.levels.icon) msg.page = 1;
                    if (newReact._emoji.id === emotes.messages.iconAccount) msg.page = 2;
                    if (newReact._emoji.id === emotes.messages.iconHistory) msg.page = 3;
                    if (newReact._emoji.name === "📈") msg.page = 4;
                    if (newReact._emoji.id === emotes.badges.hacker) msg.page = 5;
                    if (newReact._emoji.id === emotes.ul.settings) msg.page = 999;

                    let lazy = [[emotes.stats.stars, "stars"], [emotes.stats.diamonds, "diamonds"], [emotes.stats.scoins, "scoins"], [emotes.stats.ucoins, "ucoins"], [emotes.stats.demons, "demons"], [emotes.stats.cp, "cp"], [emotes.stats.net, "net"]].find(item => newReact._emoji.id === item[0] ? true : newReact._emoji.name === item[0]);

                    if (!(lazy === undefined)){
                        msg.page = 4;
                        data.settings.stat = lazy[1];
                        reload = 1;
                    };
                    
                    if (!(oldPage === msg.page)) msg.localPage = 0;
                    if (msg.page === 4 && msg.localPage > 1) msg.localPage = 1;
                    if (reload || !(oldPage === msg.page) || !(oldLocalPage === msg.localPage)) loadPage(msg.page, msg.localPage);
                });

                woof.reacts(botMsg, [emotes.ul.prev, emotes.ul.next, data.display.settings > 0 ? emotes.ul.settings : null, "👤", emotes.badges.hacker, "📈", emotes.levels.icon, emotes.messages.iconAccount, emotes.messages.iconHistory, ...Object.values(emotes.stats).slice(0, 7)]);
            };
        })
    })
}

///////////////////////////////////////////

/** Extra Command Keys
 * @syntax bot command inputs
 * @subdesc short description for help page
 * @desc description for help page
 * @ex command examples
 * @color command's help page color
 */

const commands = [
    {useable: 1, level: settings.levels.Blocked, commands: ["help", "command", "commands", "about", "cmd", "cmds", "invite"], execute: help,
    syntax: ["%command or page%"], desc: "Trigger Help Text", subdesc: `you're already here`, ex: [null, "badges", "profile", "request"]},
    {useable: 1, level: settings.levels.Blocked, commands: ["ping", "woof"], execute: pinger},
    {useable: 1, level: settings.levels.Normal, commands: ["request", "req"], execute: requestUser,
    ex: ["Michigun", "10670782"], desc: "Enter a Geometry Dash player's username or player id to request them for the Updated Leaderboard"},
    {useable: 1, level: settings.levels.Officer, commands: ["break"], execute: breaker},
    {useable: 1, level: settings.levels.Normal, commands: ["leaderboard", "ldbr", "ranks", "top", "creators"], execute: leaderboard,
    syntax: ["%stat name%"], desc: "Loads the Discord version of the Updated Leaderboard", subdesc: "UL Leaderboard", ex: [null, ...Object.keys(settings.statKeys)]},
    {useable: 1, level: settings.levels.Normal, commands: ["profile", "user", "levels", "lvls", "progress", "prog", "cmts", "cmtslvls", "settings", "hacks"], execute: profile}
];



/** Hidden Commands
 * @Dedicated to those that want to be slick, nice try 😉
 */

require("./commandsHidden.js").commands.map(cmd => {
    cmd.type = 1;
    commands.push(cmd);
});

commands.map((cmd, i) => {
    let {desc, syntax, ex, level} = cmd,
    localDesc = typeof desc === "string" ? `\`\`\`${desc}\`\`\`` : "", localEmbed = new Discord.MessageEmbed()
        .setColor(typeof cmd.color === "string" ? cmd.color : settings.colorKey.ul)
        .setTitle(`${ul.emote(+cmd.emote > 0 ? cmd.emote : emotes.ul.info)} Page: \`${cmd.commands[0]}\`${[level >= settings.levels.Helper ? emotes.badges.helpers[level-settings.levels.Helper] : 0].filter(item => +item >0).map(item => {return ul.emote(item)}).join(" ")}`);
    
    if (Array.isArray(syntax)) localDesc += `\n**Parameters:** ${syntax.length === 0 ? `_none_` : syntax.map(item => {return `\`<${item}>\``}).join(", ")}${syntax.find(item => item.includes("%")) === undefined ? `` : `\n\n${ul.emote(emotes.ul.warning)} *<% %> parameters are optional*`}`;
    if (Array.isArray(cmd.commands) ? cmd.commands.length > 1 : false) localEmbed.addField(`**Quick Commands:**`, `> *These will all execute the same command and some may execute different actions within command executions*\n\n${JSON.parse(JSON.stringify(cmd.commands)).slice(1, cmd.commands.length).map(item => {return `\`${item}\``}).join(", ")}\n_\n_`);
    if (Array.isArray(ex) ? ex.length > 0 : false) localEmbed.addField(`**Examples:**`, ex.map(item => {return `${settings.characters.bulletPoint} \`${settings.prefixes[0]}${cmd.commands[0]}${typeof item === "string" || Array.isArray(item) ? ` ${Array.isArray(item) ? item[1] : item}` : ``}\`${Array.isArray(item) ? ` ${ul.emote(emotes.badges.helpers[item[0]-settings.levels.Helper])}` : ``}`}).join("\n")+"\n_\n_");

    if (localDesc.length > 0) localEmbed.setDescription(`${localDesc}${Array.isArray(localEmbed.fields) && Array.isArray(syntax) ? localEmbed.fields.length > 0 ? `\n\n${settings.lines.dashed}` : "" : ""}\n_\n_`);

    commands[i].help = localEmbed;
});

module.exports = {
    timeoutsCheck: timeoutsCheck,
    timeoutsAdd: timeoutsAdd,
    timeouts: timeouts,
    commands: commands,
    keyCode: require("./commandsHidden.js").keyCode,
    profile: profile
};