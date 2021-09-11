const settings = require("./libraries/settings.json");
const private = require("./libraries/private.json");
const emotes = require("./ul/Discord/emotes.json");
const commands = require("./commands.js");
const woof = require("./libraries/extensions.js");
const Discord = require("discord.js");
const client = new Discord.Client();
const actions = require("./libraries/actions");
const ul = require("./ul/index");

///////////////////////////////////////////
function reloadRefreshes(client) {
    require("./refreshes").refreshes.map(item => {
        if (!item.useable || typeof item.execute != 'function') return;
        if (item.lastUsed != null && Date.now()-Number(item.lastUsed) < item.cooldown) return;
        item.lastUsed = Date.now();
        
        try {
            item.execute(client);
        } catch (err) {
            console.log(err);
        }
    })
}

function messageReactions(client, channelID, messageID, user, reaction) {
    let data = woof.getItemsWithProperty(ul.properties.properties, require("./storedData/guilds.json"), [84, 85, 36], ul.properties.propertyComs[2]);

    data.map(guild => {
        let isUsed = 0;

        [36, 84, 85].map(async key => {
            if (guild[key] == null || !(isUsed === 0)) return;
            
            if (channelID === "454918605302398976" ? true : Array.isArray(guild[key]) ? guild[key].find(item => item === channelID) : guild[key] === channelID){
                const channel = await client.channels.fetch(channelID);
                if (channel == null) return;

                const msg = await channel.messages.fetch(messageID);
                if (msg == null) return;
                // actions

                if (!(user.data.level >= settings.levels.Helper)) return;
                // helper actions

                if (key === 36) actions.actions[3](client, msg, reaction, user);
                if (key === 85) actions.actions[6](client, msg, reaction, user);
                if (key === 84) actions.actions[8](client, msg, reaction, user);
                
            };
        });
    });
}

function localPageCheck(input, currentPage) {
    let returnValue = {res: 0, localPage: +currentPage > 0 ? +JSON.parse(JSON.stringify(currentPage)) : 0};
    input = typeof input == 'string' ? input : "";
    
    if (["next", "forward", "+1"].some(item => item === input.toLowerCase())) returnValue.localPage++;

    if (["prev", "previous", "back", "-1"].some(item => item === input.toLowerCase())) returnValue.localPage--;

    if (input.toLowerCase().startsWith("page ")) returnValue.localPage = Math.round(input.split(" ")[1])-1;

    returnValue.localPage = returnValue.localPage > 0 ? returnValue.localPage : 0;
    returnValue.localPage = returnValue.localPage < 65535 ? returnValue.localPage : 65534;

    if (+currentPage != returnValue.localPage) returnValue.res = 1;
    return returnValue;
}

function noCommandsPermission(channel) {
    try { channel.send(`${woof.emote(emotes.ul.error)} **${settings.texts.notBotChannel}**`); } catch {};
}

function noPermission(channel) {
    try { channel.send(`${woof.emote(emotes.ul.error)} **${settings.texts.permission}**`); } catch {};
}
///////////////////////////////////////////

client.login(settings.beta && !settings.forceMainLogin ? private.tokens.beta : private.tokens.main);

client.on('raw', packet => {
    const {t, d} = packet;
    if (settings.refreshes) reloadRefreshes(client);

    if (d == null ? 1 : d.member == null ? 1 : d.member.user == null ? 1 : d.member.user.bot) return;

    d.member.user.data = woof.properties(ul.properties.properties, require("./storedData/users.json")[d.member.user.id], ul.properties.propertyComs[2]);
    d.member.user.data = Array.isArray(d.member.user.data) ? d.member.user.data[0] : null;

    if (d.member.user.data == null) return;
    d.member.user.tag = `${d.member.user.username}#${d.member.user.discriminator}`;
    
    if (t === 'MESSAGE_REACTION_ADD') messageReactions(client, d.channel_id, d.message_id, d.member.user, d.emoji);
})

client.on('guildMemberAdd', packet => {
    actions.actions[5](client, null, packet.guild, packet.user);
})

client.on('guildMemberRemove', packet => {
    if (!packet.guild.deleted) actions.actions[5](client, null, packet.guild, packet.user);
})

client.on('message', msg => {
    if (msg.channel == null || msg.author.bot) return;

    msg = {
        raw: msg,
        guildName: msg.guild === null ? "" : msg.guild.name,
        guildID: msg.guild === null ? "" : msg.guild.id,
        channelName: msg.channel.name === undefined ? "" : msg.channel.name,
        channelID: msg.channel.id,
        disTag: msg.author.tag,
        disID: msg.author.id,
        content: typeof msg.content === "string" ? msg.content : "",
        args: [],
        prefix: null,
        page: 0,
        localPage: 0,
        localStat: 0,
        level: 0,
        slashes: 0,
        commands: 0,
        caller: null,
        command: 0,
        data: {
            guild: woof.properties(ul.properties.properties, require("./storedData/guilds.json")[msg.guild === null ? "" : msg.guild.id], ul.properties.propertyComs[2]),
            user: woof.properties(ul.properties.properties, require("./storedData/users.json")[msg.author.id], ul.properties.propertyComs[2]),
        },
        commandsDirection: function(type, addOn){
            return ["next/prev:turns page", "page #:to page"].map(item => {
                item = item.split(":");
                item = type === 1 ? `\`${item[0]}\`` : `\`${item[0]}\` *- ${item[1]}*`;
                return `${addOn == null ? `` : addOn}${item}`;
            }).join(type === 1 ? " " : "\n");
        }
    };

    msg.awaitMessages = function(setTime, localPage, commandDisplay, execute, setChannel, setDeletion) {
        (+setChannel > 0 ? setChannel : msg.raw.channel).awaitMessages(newMsg => {
            if (newMsg.author.id != msg.disID || +msg.page < 0) return;
            let reload = 0;
            newMsg.content = typeof newMsg.content === "string" ? newMsg.content : "";

            if (settings.prefixes.some(prefix => newMsg.content.toLowerCase().startsWith(prefix)) || ["end", "cancel"].some(item => item.toLowerCase() === newMsg.content.toLowerCase())) msg.page = -1;

            if (commandDisplay && ["command", "commands", "cmds", "cmd", "help"].some(item => item === newMsg.content.toLowerCase())) {
                msg.commands = msg.commands > 0 ? 0 : 1;
                reload = 1;
            };

            if (localPage) {
                let res = localPageCheck(newMsg.content, msg.localPage);
                if (res.res) reload = 1;
                msg.localPage = res.localPage;
            };

            if (typeof execute === 'function') execute(newMsg, reload);
            if (setDeletion) newMsg.delete().catch(err => {});
        }, {time: setTime});
    };

    msg.awaitReactions = function(reactionMsg, endTime, pagination, execute) {
        reactionMsg.awaitReactions(function(reaction, user) {
            if (user.id != msg.disID || +msg.page < 0) return;
            let reload = 0;

            if (pagination) {
                let res = localPageCheck(reaction._emoji.id == emotes.ul.prev ? "-1" : reaction._emoji.id == emotes.ul.next ? "+1" : 0, msg.localPage);
                msg.localPage = res.localPage;
                reload = res.res;
            };

            if (typeof execute == 'function') execute(reaction, user, reload);
            reaction.users.remove(user.id).catch(err => {});
        }, {time: endTime});
    };

    ["user", "guild"].map(key => {
        msg.data[key] = msg.data[key] == null ? {} : Array.isArray(msg.data[key]) ? msg.data[key][0] : msg.data[key];
    });

    msg.prefix = settings.prefixes.map(item => {return `${item}${settings.beta ? settings.betaPrefix : ``}`}).find(item => msg.content.toLowerCase().startsWith(item.toLowerCase()));
    msg.level = isNaN(+msg.data.user.level) ? 0 : +msg.data.user.level;

    if (msg.level <= settings.levels.Banned) return;
    if (msg.prefix != null) {
        msg.slashes = msg.content.split("/").length-1;
        msg.content = msg.content.substr(msg.prefix.length);

        while (msg.content.startsWith(" ")) msg.content = msg.content.slice(1);
        ["/", "<", ">"].map(key => {
            while (msg.content.includes(key)) msg.content = msg.content.replace(key, "");
        });

        msg.args = msg.content.split(" ").filter(item => typeof item != "string" ? false : item.length > 0);
        
        if (msg.args.length > 0){
            msg.content = msg.content.substr(msg.args[0].length+1);
            msg.command = woof.findCommand(msg.args[0]);
            if (msg.command != null) msg.caller = woof.findCaller(msg.command, msg.args[0].toLowerCase());
        };
    };

    if ((Array.isArray(msg.data.guild.channelRequests) ? msg.data.guild.channelRequests : []).some(item => item == msg.channelID) && !settings.beta){
        msg.command = woof.findCommand("req");
        if (msg.level < msg.command.level) return noPermission(msg.raw.channel);
        
        while (msg.content.includes("/")) {
            msg.content = msg.content.replace("/", "");
            msg.slashes++;
        };

        if (typeof msg.command.execute == 'function') try { msg.command.execute(client, msg); } catch (err) {console.log(err)};

    }else if ((Array.isArray(msg.data.guild.channelCountings) ? msg.data.guild.channelCountings : []).some(item => item == msg.channelID)) {
        while (msg.content.includes(" ")) msg.content = msg.content.replace(" ", "");
        if (msg.content == "" || isNaN(+msg.content)) msg.raw.delete().catch(err => {});

    }else if (msg.command != null ? msg.command.useable : false) {
        if (Array.isArray(msg.data.guild.channelBots) ? msg.data.guild.channelBots.length > 0 ? !msg.data.guild.channelBots.some(item => item == msg.channelID) : false : false) return noCommandsPermission(msg.raw.channel);
        if (msg.level < (settings.beta ? settings.levels.Special : msg.command.level)) return noPermission(msg.raw.channel);
        if (typeof msg.command.execute == 'function') try { msg.command.execute(client, msg); } catch (err) {console.log(err)};
    };
});
