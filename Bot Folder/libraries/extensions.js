const settings = require("./settings.json");
const emotes = require("../ul/Discord/emotes.json");
const ul = require("../ul/index");
const jimp = require("jimp");

module.exports = {
    emote(input, animated, inputName, link){
        return ul.emote(input, animated, inputName, link);
    },

    findCommand(input) {
        if (typeof input != 'string') return;
        return require("../commands").commands.find(item => item.commands.includes(input.toLowerCase()));
    },

    findCaller(cmd, input) {
        if (typeof input != 'string' || cmd == null) return;
        return cmd.commands.find(caller => caller === input.toLowerCase());
    },

    netScore(user, makeString){
        return ul.netScore(user, makeString);
    },

    base64(input, encode, removeEnd, isDiscordText){
        return ul.base64(input, encode, removeEnd, isDiscordText);
    },

    groups(input, divisions, cutOff){
        return ul.groups(input, divisions, cutOff);
    },

    encrypt(input, key) {
        return Buffer.from(this.cipher(input, key)).toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
    },
    
    decrypt(input, key) {
        return this.cipher(Buffer.from(input.replace(/_/g, '/').replace(/-/g, '+'), 'base64').toString(), key);;
    },
    
    chr(ascii) {
        return String.fromCodePoint(ascii);
    },
    
    text2ascii(input) {
        return String(input).split('').map(letter => letter.charCodeAt());
    },
    
    cipher(input, key) {
        key = this.text2ascii(key);
        input = this.text2ascii(input);
        let cipher = '';
        
        for (let i = 0; i < input.length; i++) {
            cipher += this.chr(input[i] ^ key[i % key.length]);
        };
        return cipher;
    },
    
    sha1(input) {
        return crypto.createHash("sha1").update(input, "binary").digest("hex");
    },

    objectReverse(mapKey){
        return ul.objectReverse(mapKey);
    },

    properties(mapKey, input, separator, executeAfter){
        return ul.dataTranslate(mapKey, input, separator, executeAfter);
    },

    tagClean(input){
        return ul.tagClean(input);
    },

    getUserLevel(input){
        let returnValue = 0;
        input = this.tagClean(input);

        if (Number(input) > 0){
            input = require("./../storedData/users.json")[input];
            if (typeof input === "string"){
                returnValue = this.properties(ul.properties.properties, input, ":")[0];
                returnValue = typeof returnValue === "object" ? isNaN(Number(returnValue.level)) ? 0 : Number(returnValue.level) : 0;
            };
        };

        return returnValue;
    },

    getRate(returnEmote, lvlRaw, stars, featured, epic, legendary, difficultyFace){
        return ul.getRate(returnEmote, lvlRaw, stars, featured, epic, legendary, difficultyFace);
    },

    loadingMsg(getIcon, addOn){
        addOn = typeof addOn === "string" ? addOn : "";
        let messages = ul.loadingMsg;
        return `${getIcon ? `${this.emote(emotes.ul.loading, 1)} ` : ``}${addOn}${messages[Math.floor(Math.random()*messages.length)]}${addOn}`;
    },

    replaceAdvanced(input, replaceItem, replaceWith){
        if (typeof input === "string"){
            while (input.includes(replaceItem)){
                input = input.replace(replaceItem, replaceWith);
            };
        };
        return input;
    },

    embedPlayerDefault(embed, user, authorMsg){
        if (typeof user === "object"){
            embed.setFooter([`PlayerID: ${user.playerID}`, `AccountID: ${user.accountID}`].join(" | "));
            if (typeof authorMsg === "string"){
                if (authorMsg.length > 0){
                    embed.setAuthor(authorMsg, +user.accountID === 1919857 ? this.emote(emotes.icons.woof, 0, 0, 1) : [settings.links.gdBrowser.link, settings.links.gdBrowser.endPoints.icon].join("/").replace("~0~", user.playerID).replace("~1~", user.gamemode === 'dart' ? 'wave' : user.gamemode), [settings.links.gdBrowser.link, settings.links.gdBrowser.endPoints.profile, user.playerID].join("/"));
                };
            };
        };
    },

    requestRequirements(user, addOn){
        if (typeof user === "object"){
            let returnValue = 0;

            settings.requirementsRequestUser.map(item => {
                let localItem = {};
                Object.keys(item).map(key => {
                    if (Object.keys(settings.statKeys).some(stat => stat === key) || key === "mod"){
                        localItem[key] = item[key];
                    };
                });
                if (Object.keys(localItem).length > 0){
                    if (Object.keys(localItem).every(key => Number(user[key]) >= localItem[key])){
                        returnValue++;
                    };
                };
            });

            return returnValue;
        }else{
            return settings.requirementsRequestUser.map(item => {
                if (typeof item === "object"){
                    item = typeof item.text === "string" ? item.text : Object.keys(item).map(key => {
                        if (!(settings.statKeys[key] === undefined) && !(item[key] === undefined)){
                            return `${item[key]} ${settings.statKeys[key][0].toLowerCase()}`;
                        }else{
                            return `ERROR`;
                        };
                    }).filter(key => typeof key === "string").join(" and ");
                    return `${typeof addOn === "string" ? addOn : ""}${settings.characters.bulletPoint} ${item}`;
                };
            }).filter(item => typeof item === "string").join("\n");
        };
    },

    tag(id){
        return {
            user: `<@${id}>`,
            channel: `<#${id}>`,
            role: `<@&${id}>`
        };
    },

    statsDisplay(user, keys, emoteKeys, chars, addOn, useSpace, locks, ranks){
        addOn = typeof addOn === "string" ? addOn : "`";
        keys = Array.isArray(keys) ? keys : [keys];
        locks = Array.isArray(locks) ? locks : [locks];
        ranks = Array.isArray(ranks) ? ranks : [ranks];
        chars = Number(chars) >= 0 ? Number(chars) : 7;
        let returnValue = [];

        keys.map((key, i) => {
            if (typeof user[key] === "string" || (typeof user[key] === "number" && !(isNaN(user[key])))){
                let returnString = JSON.parse(JSON.stringify(user[key])).toString();
                while (returnString.length < chars){
                    returnString = ":"+returnString;
                };
                returnString = `${Number(emoteKeys[key]) > 0 ? `${this.emote(emoteKeys[key])} ` : ``}${addOn}${this.replaceAdvanced(returnString, ":", typeof useSpace === "string" ? useSpace : settings.characters.spaces)}${addOn}${+ranks[i] > 0 && !(locks[i]) ? ` *#${ranks[i]}*` : locks[i] ? this.emote(emotes.stats.lock) : ``}`;
                returnValue.push(returnString);
            };
        });

        return returnValue;
    },

    titleDisplay(ban, helper, verified, sg, hacker){
        let returnValue = [];
        let lvlNames = this.objectReverse(settings.levels);

        if (+helper > 0) returnValue.push(`${this.emote(emotes.badges.helpers[(+helper)-1])}${lvlNames[helper+settings.levels.Helper-1] == null ? `` : ` **${lvlNames[helper+settings.levels.Helper-1].replace("Developer", "Dev")}**`}`);
        if (verified && !ban) returnValue.push(`${this.emote(emotes.badges.ul)} **Verified**`);
        if (sg && !ban) returnValue.push(`${this.emote(emotes.badges.sg)} **Star Grinder**`);
        if (hacker) returnValue.push(`${this.emote(emotes.badges.hacker)} **Hacker**`);

        return returnValue;
    },

    likes(likes){
        return +likes < 0 ? emotes.levels.dislikes : emotes.levels.likes;
    },

    ucoins(ucoins, verified){
        let returnValue = [];

        for (let counter = 0; counter < (+ucoins > 0 ? +ucoins : 0); counter++){
            returnValue.push(this.emote(verified ? emotes.levels.ucoins : emotes.levels.unverifiedUcoins));
        }

        return returnValue.join(" ");
    },

    levelsDisplay(levels, page, perPage, addSongs){
        levels = JSON.parse(JSON.stringify(Array.isArray(levels) ? levels : []));
        page = +page > 0 ? +page : 0;
        perPage = +perPage > 0 ? +perPage : 5;

        return levels = levels.map(lvl => {
            if (lvl == null) return;
            if (!(typeof lvl === "object")) return;
            return `${lvl.difficultyEmote} **${lvl.name}** _(${lvl.id})_${lvl.description == null ? `\n` : lvl.description.length === 0 ? `\n` : `\`\`\`${lvl.description}\`\`\``}${this.emote(emotes.levels.downloads)} \`${lvl.downloads}\` ${this.emote(this.likes(lvl.likes))} \`${lvl.likes}\`${+lvl.stars > 0 ? ` ${this.emote(emotes.stats.stars)} \`${lvl.stars}\`` : ``}${+lvl.ucoins > 0 ? ` ${this.ucoins(lvl.ucoins, +lvl.ucoinsVerified)}` : ``}${addSongs && !(lvl.song == null) && typeof lvl.song === "object" ? `\n\n:musical_note: **${lvl.song.name}** _(${lvl.song.id})_` : ``}`;
        }).filter(item => typeof item === "string").join("\n\n\n");
    },

    messagesDisplay(messages, page, perPage, hideID){
        return (Array.isArray(messages) ? messages : []).map(msg => {
            if (!(typeof msg === "object") || msg == null) return

            let partTop = [hideID ? null : `**MsgID:** \`${msg.messageID}\``, typeof msg.levelID === "string" ? msg.levelID.length > 0 ? `**LvlID:** \`${msg.levelID}\`` : null : null].filter(item => item != null).join(" ");
            
            return `${partTop.length > 0 ? `${partTop} ` : ``}\`\`\`${msg.message}\`\`\`${[isNaN(Number(msg.likes)) ? null : `${this.emote(this.likes(msg.likes))} \`${msg.likes}\``,typeof msg.time === "string" ? msg.time.length > 0 ? `${msg.time} ago` : null : null].filter(item => !(item === null)).join(" ")}`;
        }).filter(item => typeof item === "string").join("\n\n\n");
    },

    mediaDisplay(user, keys, ban){
        user = typeof user === "object" ? JSON.parse(JSON.stringify(user)) : {};
        keys = Array.isArray(keys) ? keys : [keys];
        let returnValue = [], keyLinks = settings.links,
        keyNames = {owner: "Server Owner", tag: "**Tag:**", youtube: "YouTube", twitter: "Twitter:", twitch: "Twitch:", instagram: "IG:", github: "Github:", server: "Server:", cmts: "Comments:", lvls: "Levels:"},
        emoteKeys = {owner: emotes.ul.owner, tag: emotes.badges.link, youtube: emotes.media.youtube, twitter: emotes.media.twitter, twitch: emotes.media.twitch, instagram: emotes.media.instagram, github: emotes.media.github, server: emotes.media.discord, cmts: emotes.messages.icon, lvls: emotes.levels.icon};

        keys.map(key => {
            if (typeof key === "string"){
                if (["github", "instagram", "server", "tag", "owner"].some(item => key.toLowerCase() === item) && ban) return;
                if (!(user[key] === "_")){
                    if (typeof user[key] === "string" && !(key.toLowerCase() === "area")){
                        if (user[key].length > 0){
                            if (key.toLowerCase() === "tag"){
                                returnValue.push(`${+emoteKeys[key] > 0 ? `${this.emote(emoteKeys[key])} ` : ``}${keyNames[key]} \`${user[key]}\``);
                            }else{
                                returnValue.push(`${+emoteKeys[key] > 0 ? `${this.emote(emoteKeys[key])} ` : ``}${keyNames[key].endsWith(":") ?  `[${keyNames[key]} ${key.toLowerCase() === "server" ? `` : `@`}${user[key]}](${keyLinks[key]+user[key]})` : `[${keyNames[key]}](${this.replaceAdvanced(keyLinks[key]+user[key], " ", "%20")})`}`);
                            };
                        };
                    }else if (key.toLowerCase() === "area" && typeof user.area === "object" && !(user.area == null)){
                        returnValue.push(`${typeof user.area.icon === "string" ? user.area.icon.length > 0 ? user.area.icon+" " : `` : ``}**${Array.isArray(user.area.country) ? user.area.country[0] : user.area.country}**`);
                    }else if (typeof user[key] === "number" && (key.toLowerCase() === "owner" ? Number(user[key]) === 1 : true)){
                        user[key] = isNaN(Number(user[key])) ? 0 : Number(user[key]);
                        returnValue.push(`${+emoteKeys[key] > 0 ? `${this.emote(emoteKeys[key])} ` : ``}${typeof keyNames[key] === "string" ? "**"+keyNames[key]+"** " : ``}${typeof keyNames[key] === "string" ? keyNames[key].endsWith(":") ? key.toLowerCase() === "cmts" && +user.comments > 0 ? `_Hidden_` : `_${Number(user[key]) > settings.caps.profileCmts && key.toLowerCase() === "cmts" ? `${Number(user[key])-1}+` : Number(user[key]) > settings.caps.profileLvls && key.toLowerCase() === "lvls" ? `${Number(user[key])-1}+` : user[key]}_` : `` : ``}`);
                    };
                };
            };
        });

        return returnValue;
    },

    getItemsWithProperty(mapKey, input, getItem, separator){
        return ul.getItemsWithProperty(mapKey, input, getItem, separator);
    },

    pythagorean(x, y, z){
        if (+x > 0 || +y > 0){
            return Math.sqrt((+x)**2 + (+y)**2);
        }else if (+z > 0 && (+x > 0 || +y > 0)){
            return Math.sqrt(z**2 - (+x > 0 ? (+x)**2 : (+y)**2));
        };
    },

    loadChart(stats, names, lb, ub, chartType, bgType, setColor, setStat, execute){
        let pathImages = "./storedData/images/",
        y = this;
        arrayStats = JSON.parse(JSON.stringify(stats)).slice(+lb > 0 ? lb : 0, +ub < 9999 ? ub : 9999),
        arrayNames = JSON.parse(JSON.stringify(names)).slice(+lb > 0 ? lb : 0, +ub < 9999 ? ub : 9999),
        statsRaw = [], arrayGains = [], statsMax = 0, statsMin = 0;
        chartType = +chartType > 0 ? Math.floor(chartType) : 0;
        setColor = (Array.isArray(setColor) ? setColor : typeof setColor === "string" && !(setColor === "") && !(setColor === "_") ? this.hexToRGB(setColor) : [255, 255, 255]).map(item => {
            return +item > 0 ? +item : 0;
        }).slice(0, 3);

        arrayStats.map((item, i) => {
            if (!(i === arrayStats.length-1) && chartType === 1){
                item = Number(arrayStats[i+1]) - Number(item);
                if (!(item === NaN)){
                    arrayGains.push(item);
                    arrayStats[i] = item;
                    arrayNames[i] = [arrayNames[i], arrayNames[i+1]].map(item => {
                        item = typeof item === "string" ? item.includes("w ago")? item.split("w")[0] : item.substr(0, 2) : undefined;
                        return item;
                    }).join("-");
                };
            }else{
                arrayStats[i] = Number(arrayStats[i]);
            };
        });


        let gainsMax = Math.abs(JSON.parse(JSON.stringify(arrayGains)).sort((a, b) => Math.abs(b)-Math.abs(a))[0]),
        localStatName = settings.statKeys[Object.keys(settings.statKeys)[+setStat > 0 ? setStat : 0]],
        localIncrement = settings.chart.statIncrements[localStatName[2]] === undefined ? settings.chart.statIncrements.default : settings.chart.statIncrements[localStatName[2]];
        
        if (typeof execute === "function" && Array.isArray(arrayStats) && Array.isArray(arrayNames)){
            if (arrayStats.length < 2){
                execute(-1);
            }else if (arrayStats.length > 0){
                jimp.read(pathImages+"canvas.png", function(err, canvas){
                    jimp.read((y.bgprogCheck(bgType) === 3 ? bgType : settings.images[`chart${["UL", "SG", "CP"][y.bgprogCheck(bgType)]}`]), function(err, bg){
                        jimp.loadFont(jimp.FONT_SANS_32_WHITE).then(fontWhite => {
                        jimp.loadFont('./storedData/fonts/open-sans-32-orange/open-sans-32-white.fnt').then(fontOrange => {
                        jimp.loadFont('./storedData/fonts/open-sans-32-green/open-sans-32-white.fnt').then(fontGreen => {
                        jimp.loadFont('./storedData/fonts/open-sans-32-red/open-sans-32-white.fnt').then(fontRed => {
                        canvas.resize(settings.chart.size[0], settings.chart.size[1]);
                        bg.resize(canvas.getWidth()-2*settings.chart.borderWidth, canvas.getHeight()-2*settings.chart.borderWidth-settings.chart.barBottom-settings.chart.barTop)
                        canvas.composite(bg, settings.chart.lineWidth, settings.chart.lineWidth+settings.chart.barTop, {}, function(err, graph){

                            statsRaw = arrayStats.map((item, i) => {
                                return +item;
                            }).sort((a, b) => a - b);

                            statsMin = statsRaw[0];
                            statsMax = statsRaw[statsRaw.length-1];

                            let dataPoints = arrayStats.map((item, i) => {
                                item = +item;
                                let pointX = settings.chart.borderWidth+settings.chart.bounds[0]+0.5*settings.chart.pointSize[0]+(i)*((canvas.getWidth()-2*settings.chart.borderWidth-2*settings.chart.bounds[0]-settings.chart.pointSize[0])/(arrayStats.length-1)),
                                pointY = settings.chart.borderWidth+settings.chart.barTop+settings.chart.bounds[1]+0.5*settings.chart.pointSize[1]+(statsMax === statsMin ? 0.5 : Math.abs(item-statsMax)/Math.abs(statsMax-statsMin))*((canvas.getHeight()-settings.chart.barBottom-settings.chart.barTop-2*settings.chart.borderWidth-2*settings.chart.bounds[1]-settings.chart.pointSize[1]));
            
                                if (chartType === 1){
                                    pointX = settings.chart.borderWidth+settings.chart.binGaps+settings.chart.bounds[0]+(i+0.5)*(graph.getWidth()-2*settings.chart.borderWidth-2*settings.chart.binGaps-2*settings.chart.bounds[0])/arrayGains.length;
                                    //pointX = settings.chart.borderWidth+settings.chart.binGaps+settings.chart.bounds[0]+(i)*((graph.getWidth()-2*settings.chart.borderWidth-2*settings.chart.bounds[0]-settings.chart.binGaps*(arrayGains.length+2))/(arrayGains.length));
                                };

                                return [pointX, pointY];
                            });

                            function chartComplete(graph){
                                graph.write("./chart.png", () => {
                                    if (typeof execute === "function") execute("chart.png");
                                })
                            };
                
                            function generatePoints(graph, counter, execute){
                                if (counter < dataPoints.length && chartType === 0){
                                    jimp.read(pathImages+`${localStatName[2]}.png`, function(err, point){
                                        point.resize(settings.chart.pointSize[0], settings.chart.pointSize[1]);
                                        graph.composite(point, dataPoints[counter][0]-0.5*settings.chart.pointSize[0], dataPoints[counter][1]-0.5*settings.chart.pointSize[1], {}, function(err, graph){
                                            generatePoints(graph, counter+1, execute);
                                        });
                                    });
                                }else{
                                    execute(graph);
                                };
                            };

                            function generateLines(graph, counter, execute){
                                if (counter < dataPoints.length-1 && chartType === 0){
                                    jimp.read(pathImages+"square.png", function(err, line){
                                        let lengthX = dataPoints[counter+1][0]-dataPoints[counter][0], lengthY = dataPoints[counter][1]-dataPoints[counter+1][1], degrees = 180*Math.atan(lengthY/lengthX)/Math.PI;
                                        degrees = 180*Math.atan(lengthY/lengthX)/Math.PI;
                                        
                                        let lengthZ = y.pythagorean(lengthX, lengthY) === undefined ? lengthX : y.pythagorean(lengthX, lengthY)//+settings.chart.lineWidth*Math.sin(degrees);
                                        
                                        line
                                            .color([{ apply: 'red', params: [setColor[0]] }, { apply: 'green', params: [setColor[1]] }, { apply: 'blue', params: [setColor[2]] }])
                                            .opacity(0.55)
                                            .resize(lengthZ, settings.chart.lineWidth)
                                            .rotate(degrees);
                                        graph.composite(line, dataPoints[counter][0], (dataPoints[counter+1][1] > dataPoints[counter][1] ? dataPoints[counter][1] : dataPoints[counter+1][1])-0.5*settings.chart.lineWidth, {}, function(err, graph){
                                            generateLines(graph, counter+1, execute);
                                        });
                                    });
                                }else{
                                    execute(graph, 0);
                                };
                            };

                            function generateText(graph, counter, execute){
                                if (chartType === 1 ? counter < arrayGains.length : counter < arrayStats.length){
                                    if (dataPoints[counter] == null) {
                                        generateText(graph, counter+1, execute);
                                        return;
                                    };
                                    let text = typeof arrayStats[counter] === "string" || typeof arrayStats[counter] === "number" ? arrayStats[counter].toString().length > 0 ? `${+arrayStats[counter] < 0 || !(chartType === 1) ? `` : `+`}${arrayStats[counter]}` : "-" : "-",
                                    useFont = chartType === 1 ? Number(arrayGains[counter]) < 0 ? fontRed : fontGreen : fontWhite,
                                    textX = dataPoints[counter][0]-0.5*jimp.measureText(useFont, text),
                                    textY = 0.5*jimp.measureTextHeight(useFont, text);

                                    if (dataPoints.length > settings.chart.textCaps[chartType] && !(counter === 0 || counter === Math.floor((dataPoints.length-(chartType === 1 ? 2 : 1))/2) || counter === dataPoints.length-(chartType === 1 ? 2 : 1))){
                                        generateText(graph, counter+1, execute);
                                    }else{
                                        graph.print(useFont, textX > settings.chart.borderWidth+2 ? textX+jimp.measureText(useFont, text) < graph.getWidth()-settings.chart.borderWidth-2 ? textX : graph.getWidth()-settings.chart.borderWidth-2-jimp.measureText(useFont, text) : settings.chart.borderWidth+2, settings.chart.borderWidth+0.5*settings.chart.barTop-textY, text, function(err, graph){
                                            text = typeof arrayNames[counter] === "string" || typeof arrayNames[counter] === "number" ? arrayNames[counter].toString().length > 0 ? arrayNames[counter].toString() : "-" : "-";
                                            textX = dataPoints[counter][0]-0.5*jimp.measureText(fontWhite, text);
                                            textY = 0.5*jimp.measureTextHeight(fontWhite, text);
                                            graph.print(fontWhite, textX > settings.chart.borderWidth+2 ? textX+jimp.measureText(useFont, text) < graph.getWidth()-settings.chart.borderWidth-2 ? textX : graph.getWidth()-settings.chart.borderWidth-2-jimp.measureText(useFont, text) : settings.chart.borderWidth+2, graph.getHeight()-settings.chart.borderWidth-0.5*settings.chart.barBottom-textY, text, function(err, graph){
                                                generateText(graph, counter+1, execute);
                                            });
                                        });
                                    };
                                }else{
                                    execute(graph);
                                };
                            };

                            function generateBorders(graph, execute){
                                jimp.read(pathImages+"square.png", function(err, bar){
                                    bar
                                        .color([{ apply: 'red', params: [setColor[0]] }, { apply: 'green', params: [setColor[1]] }, { apply: 'blue', params: [setColor[2]] }])
                                        .resize(graph.getWidth(), settings.chart.borderWidth);
                                    graph.composite(bar, 0, 0, {}, function(err, graph){
                                        graph.composite(bar, 0, graph.getHeight()-settings.chart.borderWidth, {}, function(err, graph){
                                            bar.resize(settings.chart.borderWidth, graph.getHeight());
                                            graph.composite(bar, 0, 0, {}, function(err, graph){
                                                graph.composite(bar, graph.getWidth()-settings.chart.borderWidth, 0, {}, function(err, graph){
                                                    execute(graph);
                                                });
                                            });
                                        });
                                    });
                                });
                            };

                            function generateBars(graph, execute){
                                jimp.read(pathImages+"square.png", function(err, bar){
                                    bar.resize(graph.getWidth()-2*settings.chart.borderWidth, settings.chart.barBottom);
                                    graph.composite(bar, settings.chart.borderWidth, graph.getHeight()-settings.chart.borderWidth-settings.chart.barBottom, {}, function(err, graph){
                                        jimp.read(pathImages+"square.png", function(err, bar){
                                            bar
                                                .color([{ apply: 'red', params: [0] }, { apply: 'green', params: [0] }, { apply: 'blue', params: [0] }])
                                                .resize(graph.getWidth()-2*settings.chart.borderWidth, settings.chart.barTop);
                                            graph.composite(bar, settings.chart.borderWidth, settings.chart.borderWidth, {}, function(err, graph){
                                                execute(graph);
                                            });
                                        });
                                    });
                                });
                            };

                            function generateDividers(graph, counter, execute){
                                if (counter < settings.chart.dividers){
                                    jimp.read(pathImages+"square.png", function(err, bar){
                                        bar
                                            .resize(graph.getWidth()-2*settings.chart.borderWidth, settings.chart.dividerWidth)
                                            .opacity(0.25);
                                        graph.composite(bar, settings.chart.borderWidth, settings.chart.borderWidth+settings.chart.barTop+settings.chart.bounds[1]+0.5*settings.chart.pointSize[1]+(counter*Math.abs(graph.getHeight()-settings.chart.barBottom-settings.chart.barTop-2*settings.chart.borderWidth-2*settings.chart.bounds[1]-settings.chart.pointSize[1])/(settings.chart.dividers-1)), {}, function(err, graph){
                                            generateDividers(graph, counter+1, execute);
                                        });
                                    });
                                }else{
                                    execute(graph);
                                };
                            };

                            function generateBins(graph, counter, execute){
                                if (chartType === 1 && counter < arrayStats.length-1){
                                    if (arrayGains[counter] === 0 || gainsMax === 0){
                                        generateBins(graph, counter+1, execute);
                                    }else{
                                        jimp.read(pathImages+"square.png", function(err, bar){
                                            bar.resize(Math.abs(dataPoints[counter+1][0]-dataPoints[counter][0])-2*settings.chart.binGaps, (Math.abs(arrayGains[counter])/(localIncrement*Math.ceil(gainsMax/localIncrement)))*(graph.getHeight()-2*settings.chart.borderWidth-2*settings.chart.bounds[1]-settings.chart.barTop-settings.chart.barBottom-settings.chart.binCapOffset));
                                            
                                            if (arrayGains[counter] > 0){
                                                bar
                                                    .color([{ apply: 'red', params: [settings.chart.binColorPositive[0]] }, { apply: 'green', params: [settings.chart.binColorPositive[1]] }, { apply: 'blue', params: [settings.chart.binColorPositive[2]] }])
                                                    .opacity(0.35);
                                            }else if (arrayGains[counter] < 0){
                                                bar
                                                    .color([{ apply: 'red', params: [settings.chart.binColorNegative[0]] }, { apply: 'green', params: [settings.chart.binColorNegative[1]] }, { apply: 'blue', params: [settings.chart.binColorNegative[2]] }])
                                                    .opacity(0.35);
                                            };

                                            graph.composite(bar, dataPoints[counter][0]-0.5*bar.getWidth(), graph.getHeight()-settings.chart.borderWidth-settings.chart.barBottom-bar.getHeight(), {}, function(err, graph){
                                                generateBins(graph, counter+1, execute);
                                            });
                                        });
                                    };
                                }else{
                                    execute(graph);
                                };
                            };

                            function generateBinTop(graph, execute){
                                if (chartType === 1){
                                    let text = `${localIncrement*(Math.floor(gainsMax/localIncrement)+1)} ${localStatName[0]}`;

                                    while (settings.chart.statTextImageSpace+jimp.measureText(fontOrange, text+" -")+settings.chart.binCapOffsetBar+settings.chart.borderWidth < graph.getWidth()-settings.chart.borderWidth-5){
                                        text += ` -`;
                                    };

                                    graph.print(fontOrange, settings.chart.statTextImageSpace+settings.chart.borderWidth+settings.chart.binCapOffsetBar, settings.chart.borderWidth+settings.chart.bounds[1]+settings.chart.barTop+settings.chart.binCapOffset-4, text, function(err, graph){
                                        jimp.read(pathImages+`${localStatName[2]}.png`, function(err, point){
                                            point.resize(settings.chart.statTextImageSize, settings.chart.statTextImageSize);
                                            graph.composite(point, settings.chart.borderWidth+settings.chart.binCapOffsetBar+3, settings.chart.borderWidth+settings.chart.bounds[1]+settings.chart.barTop+settings.chart.binCapOffset-5, {}, function(err, graph){
                                                execute(graph);
                                            });
                                        });
                                    });
                                }else{
                                    execute(graph);
                                }
                            };

                            generateDividers(graph, 0, function(graph){
                                generateLines(graph, 0, function(graph){
                                    generateBins(graph, 0, function(graph){
                                        generateBinTop(graph, function(graph){
                                            generatePoints(graph, 0, function(graph){
                                                generateBars(graph, function(graph){
                                                    generateText(graph, 0, function(graph){
                                                        generateBorders(graph, function(graph){
                                                            chartComplete(graph);
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                    });
                    });
                    });
                    });
                });
            };
        };
    },

    statistics(data, getData, getAdditions){
        let returnValue = {
            additions: {},
            data: [],
            total: 0,
            min: null,
            max: null,
            sum: 0,
            mean: 0,
            median: 0,
            modeAmount: null,
            mode: [],
            range: 0,
            varience: 0,
            standardDeviation: 0,
        };

        returnValue.data = JSON.parse(JSON.stringify(data)).map(item => {
            item = isNaN(Number(item)) ? undefined : Number(item);
            if (typeof item === "number"){
                returnValue.additions[item] = returnValue.additions[item] === undefined ? 1 : returnValue.additions[item]+1;
                returnValue.sum += item;
                returnValue.min = item < returnValue.min || returnValue.min === null ? item : returnValue.min;
                returnValue.max = item > returnValue.max || returnValue.max === null ? item : returnValue.max;
            };
            return item;
        }).filter(item => typeof item === "number");

        returnValue.modeAmount = Object.values(returnValue.additions).sort((a, b) => b-a)[0];
        Object.keys(returnValue.additions).map(key => {
            if (returnValue.additions[key] === returnValue.modeAmount){
                returnValue.mode.push(Number(key));
            };
        });

        returnValue.total = returnValue.data.length;
        returnValue.mean = returnValue.sum/returnValue.total;
        returnValue.range = returnValue.max - returnValue.min;
        returnValue.median = (returnValue.total/2)%2 === 0 ? returnValue.data[returnValue.total/2] : (returnValue.data[Math.floor(returnValue.total/2)]+returnValue.data[Math.ceil(returnValue.total/2)])/2;

        if (returnValue.total > 1){
            returnValue.data.map(item => {
                returnValue.varience += !(isNaN((item-returnValue.mean)**2)) ? (item-returnValue.mean)**2 : 0;
            });
            returnValue.varience = returnValue.varience/(returnValue.total-1);
            returnValue.standardDeviation = Math.sqrt(returnValue.varience);
        }else{
            returnValue = null;
        };

        if (!(returnValue === null)){
            if (!(getData)) delete returnValue.data;
            if (!(getAdditions)) delete returnValue.additions;
            delete returnValue.varienceAdditions;
        }else{
            returnValue = {};
        };

        return returnValue;
    },

    hexToRGB(input){
        if (typeof input === "string"){
            input = JSON.parse(JSON.stringify(input));
            input = input.match(/.{1,2}/g).map(item => {
                item = parseInt(item, 16);
                return +item > 0 ? +item : 0;
            }).slice(0, 3);
        };
        return input;
    },

    rgbToHex(input, counter){
        input = Array.isArray(input) ? JSON.parse(JSON.stringify(input)) : JSON.parse(JSON.stringify([input]));

        return input.map(v => {
            if (!(+v >= 0)) return;
            v = (+v).toString(16);
            return v.length === 1 ? "0" + v : v;
        }).filter(item => typeof item === "string").join("");
    },

    lookupRegion(input){
        input = typeof input === "string" || typeof input === "number" ? input : "";
        let returnValue = typeof input === "number" ? require("../storedData/regions.json")[input] : require("../storedData/regions.json").find(item => item.toLowerCase() === input.toLowerCase());
        
        return returnValue === undefined ? null : JSON.parse(JSON.stringify(returnValue));
    },

    lookupCountry(input){
        let returnValue = null;
        if (typeof input === "string"){
            returnValue = require("./../storedData/countries.json").find(item => Array.isArray(item.country) ? item.country.find(item => typeof item === "string" ? item.toLowerCase() === input.toLowerCase() : false) : typeof item.country === "string" ? item.country.toLowerCase() === input.toLowerCase() : false);
            if (returnValue === undefined){
                returnValue = null;
            }else{
                returnValue = JSON.parse(JSON.stringify(returnValue));
                returnValue.region = this.lookupRegion(returnValue.region);
            };
        };
        return returnValue;
    },

    lookupState(input){
        let returnValue = null;
        if (typeof input === "string"){
            returnValue = require("./../storedData/states.json").find(item => item.abbrev.toLowerCase() === input.toLowerCase() ? true : Array.isArray(item.state) ? item.state.find(item => typeof item === "string" ? item.toLowerCase() === input.toLowerCase() : false) : typeof item.state === "string" ? item.state.toLowerCase() === input.toLowerCase() : false);
            if (returnValue === undefined){
                returnValue = null
            }else{
                returnValue = JSON.parse(JSON.stringify(returnValue));
                returnValue.country = this.lookupCountry(returnValue.country);
                returnValue.region = this.lookupRegion(returnValue.region);
            };
        };
        return returnValue;
    },

    lookupArea(input, returnObj){
        let returnValue = this.lookupState(input);
        if (returnValue == null) returnValue = this.lookupCountry(input);
        if (returnValue == null) returnValue = this.lookupRegion(input);

        if (!(typeof input === "string" || typeof input === "number")) returnValue = null;
        
        return returnValue;
    },

    banFrom(input, reverseEmotes){
        let returnValue = reverseEmotes ? "" : {};

        if (!(input == null)){
            Object.keys(settings.statEmotes).map(key => {
                if (reverseEmotes){
                    returnValue += +input[key] > 0 ? settings.statEmotes[key] == null ? '' : settings.statEmotes[key] : '';
                }else{
                    returnValue[key] = input.includes(settings.statEmotes[key]) ? 1 : 0;
                };
            });
        };

        return reverseEmotes ? returnValue.length > 0 ? returnValue : "_" : returnValue;
    },

    possession(input){
        return typeof input === "string" ? input.toLowerCase().endsWith("s") ? `${input}'` : `${input}'s` : input;
    },

    pluralize(input){
        if (typeof input === "number"){
            return input === 1 ? "" : "s";
        }else{
            return "";
        };
    },

    discordCharacterCheck(input){
        return typeof input === "string" ? input.match(/^[0-9a-zA-Z]+$/) ? 1 : 0 : 0;
    },

    direction(input){
        let returnValue = isNaN(Number(input)) ? 0 : Number(input);
        
        return returnValue === 1 ? "🔼" : returnValue === -1 ? "🔽" : "⚪";
    },

    directionOrder(input, returnDirection){
        let returnValue = typeof input === "string" || !(isNaN(Number(input))) ? input.toString() : "";

        if (["-1", "desc", "dsc", "descending", "descend", "down", "downward"].some(item => item.toString() === returnValue)) returnValue = -1;
        if (["1", "asc", "ascend", "ascending", "up", "forward"].some(item => item.toString() === returnValue)) returnValue = 1;
        if (typeof returnValue === "string") returnValue = 0;

        return returnDirection ? this.direction(returnValue) : returnValue;
    },

    messageFilter(input, count, page, idOrder, lvlID, lvlIDOrder, likesOrder, likeType, term){
        count = +count > 0 ? +count : 5;
        page = +page > 0 ? +page : 0;
        
        input = idOrder === 1 ? input.reverse() : input;
        
        //.sort((a, b) => idOrder === 1 ? Number(a.messageID)-Number(b.messageID) : Number(b.messageID)-Number(a.messageID))
        
        if (lvlIDOrder === -1 || lvlIDOrder === 1) input = input.sort((a, b) => lvlIDOrder === -1 ? Number(b.levelID)-Number(a.levelID) : Number(a.levelID)-Number(b.levelID));
        if (likesOrder === -1 || likesOrder === 1) input = input.sort((a, b) => likesOrder === -1 ? Number(b.likes)-Number(a.likes) : Number(a.likes)-Number(b.likes));
        
        if (likeType === 1 || likeType === -1) input = input.filter(msg => likeType === -1 ? Number(msg.likes) < 0 : Number(msg.likes) >= 0);
        if (+lvlID > 0 || +lvlID < 0) input = input.filter(msg => isNaN(Number(msg.levelID)) ? false : msg.levelID.toString().includes(lvlID.toString()));
        if (typeof term === "string" ? term.length > 0 : false) input = input.filter(msg => msg.message.toLowerCase().includes(term.toLowerCase()));

        return input.slice(page*count, (page+1)*count);
    },

    levelFilter(input, count, page, lvlID, lvlIDOrder, likesOrder, likeType, term){
        count = +count > 0 ? +count : 5;
        page = +page > 0 ? +page : 0;
        
        if (lvlIDOrder === -1 || lvlIDOrder === 1) input = input.sort((a, b) => lvlIDOrder === -1 ? Number(b.id)-Number(a.id) : Number(a.id)-Number(b.id));
        if (likesOrder === -1 || likesOrder === 1) input = input.sort((a, b) => likesOrder === -1 ? Number(b.likes)-Number(a.likes) : Number(a.likes)-Number(b.likes));
        
        if (likeType === 1 || likeType === -1) input = input.filter(msg => likeType === -1 ? Number(msg.likes) < 0 : Number(msg.likes) >= 0);
        if (+lvlID > 0 || +lvlID < 0) input = input.filter(msg => isNaN(Number(msg.levelID)) ? false : msg.id.toString().includes(id.toString()));
        if (typeof term === "string" ? term.length > 0 : false) input = input.filter(msg => msg.description.toLowerCase().includes(term.toLowerCase()));

        return input.slice(page*count, (page+1)*count);
    },

    messageFilterDisplay(page, orderID, lvlID, orderLvl, orderLikes, likeType, term){
        let desc = `**Page:** \`${page+1}\``;

        if (!(orderID == null)) desc += `\n**Date:** \`${this.direction(orderID === 0 ? -1 : orderID)}\``;
        if ([orderLvl, lvlID].some(v => !(v == null))) desc += `\n**Lvl:** \`${[orderLvl, lvlID].map((v, i) => {
            if (i === 0) return this.direction(v);
            if (i === 1 && !isNaN(Number(v)) && !(Number(v) === 0)) return v.toString();
        }).filter(item => typeof item === "string").join(" ")}\``;
        if ([orderLikes, likeType].some(v => !(v == null))) desc += `\n**Likes:** ${[orderLikes, likeType].map((v, i) => {
            if (i === 0) return `\`${this.direction(v)}\``;
            if (i === 1 && !isNaN(Number(v)) && !(Number(v) === 0)) return this.emote(this.likes(Number(v)));
        }).filter(item => typeof item === "string").join(" ")}`;
        if (!(term == null)) desc += `\n**Term:** ${typeof term === "string" ? `\`${term}\`` : `_none_`}`;

        return desc;
    },
    
    mathLog(base, value){
        return Math.log(Number(value))/Math.log(Number(base));
    },

    bool(input, resNum, defaultInput, setEmote){
        resNum = +resNum > 0 ? +resNum : 0;
        input = typeof input === "string" ? input.toLowerCase() : typeof input === "number" && !(isNaN(input)) ? input.toString() : defaultInput === undefined ? input : defaultInput;

        let returnValue = [[true, "1", "true", emotes.ul.valid, "✔"], [false, "0", "false", emotes.ul.error, "_"]].find(item => item.find(item => item === input))

        return returnValue === undefined ? [false, "0", "false", emotes.ul.error, "_"][resNum] : returnValue[resNum];
    },

    boolFlip(input){
        if (typeof input === 'string') return input.toLowerCase() === 'true' ? 0 : 1;
        return input ? 0 : 1;
    },

    reacts(message, reactions, counter){
        reactions = Array.isArray(reactions) ? reactions : [reactions];
        counter = counter > 0 ? counter : 0;
        
        if (!(reactions[counter] === undefined)){
            if (+reactions[counter] > 0 || (typeof reactions[counter] === "string" ? reactions[counter].length > 0 : false)){
                message.react(reactions[counter]).then(reacted => {
                    this.reacts(message, reactions, counter+1);
                }).catch(() => {this.reacts(message, reactions, counter+1);});
            }else if (reactions[counter] === null){
                this.reacts(message, reactions, counter+1);
            };
        };
    },

    lookupStat(input, defaultReturn, returnUsed, useSpecialFunction, returnIndex){
        input = typeof input === "string" ? input : "";
        let returnValue = null;

        Object.keys(settings.statKeys).map((key, i) => {
            let used = settings.statKeys[key].find(item => typeof useSpecialFunction === "string" ? eval(`input.toLowerCase().${useSpecialFunction}(item.toLowerCase())`) : item.toLowerCase() === input.toLowerCase());

            if (used === undefined) return;
            if (returnUsed || returnIndex) key = returnUsed ? used : i;
            returnValue = key;
        });

        return returnValue == null ? defaultReturn : returnValue;
    },

    lookupGamemode(input, returnNum){
        const icons = require("./GeometryDash/api").settings.gamemodes;
        let returnValue = Number(input) >= 0 ? icons[input] : typeof input === "string" ? icons[returnNum ? "findIndex" : "find"](icon => icon === input.toLowerCase()) : null;

        return returnValue == null ? icons[0] : returnValue;
    },

    settingsCheck(level, disID, ownerID, ulBan){
        if (level < settings.levels.Normal) return -3;
        if (level >= settings.levels.Helper) return 2;
        if (ulBan) return -2;
        if (disID === ownerID && +ownerID > 0) return 1;
        return -1;
    },

    dates(month, day, year){
        return [`${this.objectReverse(settings.months)[month]}${typeof day === "string" || typeof day === 'number' ? ` ${day}` : ``}`, typeof year === "string" || typeof year === 'number' ? year : null].filter(item => typeof item === "string").join(", ");
    },

    bgprogCheck(input, returnName, returnNames){
        let localNames = ["sg", "cp"];
        if (returnNames) return localNames;

        if (!(typeof input === "string" || (+input >= 0 && !(input == null)))) return returnName ? null : 0;
        input = input.toString().toLowerCase();
        if (input === localNames[0] || input === "0") return returnName ? localNames[0] : 1;
        if (input === localNames[1] || input === "1") return returnName ? localNames[1] : 2;
        if (input.startsWith("http") && settings.acceptableImageFiles.some(item => input.endsWith(`.${item}`))) return returnName ? "custom" : 3;
        return returnName ? null : 0;
    },

    statisticsDisplay(stats){
        if (!(!(stats == null) && typeof stats === "object")) return `*${settings.texts.empty}*`;
        
        let desc = ``, statsData = Array.isArray(stats) ? this.statistics(stats) : stats;
        
        desc += `**Entries:** \`${statsData.total}\`~**Range:** \`${statsData.range}\``;
        desc += `\n\n**Σ:** \`${statsData.sum}\`~**μ:** \`${isNaN(Number(statsData.mean)) ? statsData.mean : statsData.mean.toFixed(2)}\``;
        desc += `\n**σ:** \`${isNaN(Number(statsData.standardDeviation)) ? statsData.standardDeviation : statsData.standardDeviation.toFixed(2)}\`~**σ^2:** \`${isNaN(Number(statsData.varience)) ? statsData.varience : statsData.varience.toFixed(2)}\``;
        desc += `\n**Median:** \`${statsData.median}\``;
        
        desc += `\n\n**Max:** \`${statsData.max}\`~**Min:** \`${statsData.min}\``;
        //desc += `\n**Mode:** \`${statsData.mode.length > 0 ? statsData.mode.slice(0, 3).join(",") : `N/A`}\`~**# Modes:** \`${Number(statsData.modeAmount)}\``;

        return this.groups(desc.split("\n\n"), 1).map(item => {
            return item[0].split("\n").map(item => {
                return `${item.replace("~", `${settings.characters.spaces}  ${settings.characters.spaces}`)}`;
            }).join("\n");
        }).join("\n");
    },

    statsObject(input, net){
        let returnValue = {};

        if (!(input == null) && typeof input === "object") {
            Object.keys(settings.statKeys).map((key, i) => {
                returnValue[key] = Array.isArray(input) ? input[i] : input[key];
            });
            if (net) returnValue.net = this.netScore(returnValue);
        };

        return returnValue;
    },

    settingsChangeDefault(args, defaultReturn, successfullAddOn){
        let localArgs = Array.isArray(args) ? JSON.parse(JSON.stringify(args)).join(" ") : typeof args === 'string' ? JSON.parse(JSON.stringify(args)).toLowerCase() : ``;
        if (typeof localArgs === 'string' && !(localArgs === '') && !(localArgs === ' ') && !(localArgs === '_') && !(localArgs === 'none')) return `${typeof successfullAddOn === 'string' ? successfullAddOn : ``}${JSON.parse(JSON.stringify(args))}${typeof successfullAddOn === 'string' ? successfullAddOn : ``}`;
        return typeof defaultReturn === "string" ? defaultReturn : '_';
    },

    colorCheck(input){
        let inputs = JSON.parse(JSON.stringify((Array.isArray(input) ? input : typeof input === "string" ? this.replaceAdvanced(input, "#", "").split(" ") : [input]).slice(0, 3))),
        raw = JSON.parse(JSON.stringify(inputs)), output = "_", hex = "ffffff", rgb = 0, res = 0;
        
        if (!(this.settingsChangeDefault(input) === '_')) {
            if (!(settings.colorKey[inputs.join(" ")] === undefined)) {
                output = inputs.join(" ");
                hex = settings.colorKey[output];
                res = 3;
            }else if (inputs.length === 1 && inputs[0] === this.rgbToHex(this.hexToRGB(inputs[0])) && typeof inputs[0] === "string") {
                output = inputs[0];
                hex = inputs[0];
                res = 2;
            }else{
                while (inputs.length < 3) inputs.push(255);
                res = 1;

                hex = this.rgbToHex(inputs.map((v, i) => {
                    if (isNaN(Number(v))) return "255";
                    while (Number(v) > 255) v = Number(v)-255;
                    return Math.round(Number(v)).toString();
                }));
                output = hex;
            };
        };

        return {raw: raw, output: output, hex: hex, rgb: this.hexToRGB(hex), res: res};
    },

    playerKeyCheck(input){
        let returnValue = typeof input === "string" ? JSON.parse(JSON.stringify(input)).toLowerCase() : "";

        returnValue = Object.keys(settings.playerKey).find(key => settings.playerKey[key].find(item => item.toLowerCase() === returnValue));
        return returnValue == null ? null : returnValue;
    },

    ulDiscordData(input, mapKey, seperator, executeAfter, embedKey){
        let returnValue = embedKey == null ? input == null || Array.isArray(input) ? null : input : input[embedKey];
        if (returnValue == null) return;

        if (typeof input === 'string'){
            returnValue = input.includes(":hai_") ? typeof input.split(":hai_")[1] === 'string' ? input.split(":hai_")[1].split(":")[0] : null : JSON.parse(JSON.stringify(input));
            
            if (returnValue == null) return;
            returnValue = this.properties(mapKey, this.base64(returnValue, 0, 0, 1), seperator, executeAfter);
        }else if (typeof input === 'object') {
            returnValue = `${this.base64(`hai_${this.properties(mapKey, input, seperator, executeAfter)}`, 1, 1, 1)}`;
        };

        return returnValue;
    }
};