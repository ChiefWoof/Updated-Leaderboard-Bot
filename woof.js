const settings = require("./libraries/settings.json");
const private = require("./libraries/private.json");
const emotes = require("./libraries/emotes.json");
const commands = require("./commands.js");
const woof = require("./libraries/extensions.js");
const Discord = require("discord.js");
const client = new Discord.Client();

client.login(settings.beta && !(settings.forceMainLogin) ? private.tokens.beta : private.tokens.main);

client.on(`message`, msg => {
    msg = {
        raw: msg,
        guildName: msg.guild.name,
        guildID: msg.guild.id,
        channelName: msg.channel.name,
        channelID: msg.channel.id,
        authorTag: msg.author.tag,
        authorID: msg.author.id,
        content: typeof msg.content === "string" ? msg.content : "",
        args: [],
        prefix: null,
        page: 0,
        localPage: 0,
        localStat: 0,
        level: 0,
        command: 0,
        data: {
            guild: woof.cleanPropertyGuilds(woof.properties(settings.properties, require("./storedData/guilds.json")[msg.guild.id], settings.propertyComs[2])),
            user: woof.cleanPropertyUsers(woof.properties(settings.properties, require("./storedData/users.json")[msg.author.id], settings.propertyComs[2])),
        },
    };

    msg.prefix = settings.prefixes.map(prefix => {return `${prefix}${settings.beta ? settings.betaPrefix.toString() : ``}`}).find(prefix => msg.content.toLowerCase().startsWith(`${prefix.toLowerCase()}`));
    msg.level = isNaN(Number(msg.data.user.level)) ? 0 : Number(msg.data.user.level);

    if (!(msg.prefix === undefined)){
        msg.content = msg.content.slice(msg.prefix.length, msg.content.length);
        msg.content = msg.content.startsWith(" ") ? msg.content.slice(1, msg.content.length) : msg.content;
        msg.args = msg.content.split(" ").filter(item => typeof item === "string" ? item.length > 0 : false);
        if (msg.args.length > 0){
            msg.content = msg.content.substr(msg.args[0].length+1, msg.content.length);
            msg.command = commands.commands.find(cmd => cmd.commands.find(callers => callers.toLowerCase() === msg.args[0].toLowerCase()));
        };
    };

    if (!(msg.raw.author.bot)){
        if (typeof msg.command === "object" && (typeof msg.command === "object" ? msg.command.useable : false)){
            if (Array.isArray(msg.data.guild.channelBots) ? msg.data.guild.channelBots.length === 0 || msg.data.guild.channelBots.some(item => item === msg.channelID) : true){
                if (typeof msg.command.execute === "function" && typeof msg.command === "object"){
                    if (msg.level >= msg.command.level){
                        msg.command.execute(client, msg);
                    }else{
                        msg.raw.channel.send(`${woof.emote(emotes.ul.error)} **${settings.errors.permission}**`)
                    };
                };
            }else if (Array.isArray(msg.data.guild.channelBots) ? msg.data.guild.channelBots.length > 0 : false){
                msg.raw.channel.send(`${woof.emote(emotes.ul.error)} **${settings.errors.notBotChannel}**`);
            };
        }else if (Number(msg.data.guild.channelRequest) > 0 && msg.channelID === msg.data.guild.channelRequest && typeof msg.content.length > 0){
            let commandRequest = commands.commands.find(cmd => cmd.commands.find(callers => callers.toLowerCase() === "request"));
            if (typeof commandRequest === "object"){
                if (typeof commandRequest.execute === "function"){
                    commandRequest.execute(client, msg);
                };
            };
        }else if (Number(msg.data.guild.channelCountings) > 0 ? msg.data.guild.channelCountings.some(item => item === msg.channelID) : false){
            if (!(Number(msg.raw.content) > 0 && Math.floor(Number(msg.raw.content)) === Number(msg.raw.content))){
                setTimeout(function(){msg.raw.delete().catch(err => {});}, 1250);
            };
        }else{
            require("./refreshes.js").map(item => {
                if (item.useable && typeof item.execute === "function"){
                    if (item.lastUsed === undefined || Date.now()-Number(item.lastUsed) >= item.cooldown){
                        item.lastUsed = Date.now();
                        item.execute(client, msg);
                    };
                };
            });
        };
    };
});