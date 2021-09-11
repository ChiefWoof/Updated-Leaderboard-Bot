const private = require(`./../private.json`);
const woof = require("./../extensions.js");
const gd = require(`./settings.json`);
const apiHidden = require("./apiHidden.js");
const fetch = require('cross-fetch');
const pako = require(`pako`);

/**
 * @Description Property bin
 */

const properties = {
    colors: require("./properties/colors.json"),
    k: require("./properties/k.json"),
    objects: require("./properties/objects.json"),
    players: require("./properties/players.json"),
    leaderboardLevels: require("./properties/leaderboardLevels.json"),
    messages: require("./properties/messages.json"),
    songs: require("./properties/songs.json"),
    levels: require("./properties/levels.json"),
    mapPacks: require("./properties/mapPacks.json"),
    gauntlets: require("./properties/gauntlets.json"),
    cmts: require("./properties/cmts.json")
};

/**
 * @Description Gets main levels from the song data in settings and runs a small analysis on them
 */

function levelsMain(){
    let localAnalysis = {stars: 0, demons: 0, scoins: 0, orbs: 0}
    
    return {
        levels: gd.mainSongs.map(item => {
            localAnalysis.stars += +item.stars;
            localAnalysis.demons += +item.difficulty > 5 ? 1 : 0;
            localAnalysis.scoins += +item.scoins;
            localAnalysis.orbs += +item.orbs;
            return {
                name: typeof item.level === "string" ? item.level : item.name,
                difficulty: item.difficulty,
                difficultyEmote: woof.getRate(1, 0, 0, 0, 0, 0, item.difficulty),
                stars: item.stars,
                orbs: item.orbs,
                scoins: item.scoins,
            }
        }),
        analysis: localAnalysis
    };
};

/**
 * @Description Translets fetched GD data into a more readable format
 */

function dataTranslate(fileName, data, conditions, getFirst){
    let localIndex = 0;
    conditions.page = isNaN(+conditions.page) ? 0 : +conditions.page;
    conditions.count = isNaN(+conditions.count) ? 0 : +conditions.count;
    
    if (typeof data === "string" && !(data < 0)){
        if ([gd.endPoints.leaderboardStats, gd.endPoints.players, gd.endPoints.accounts, gd.endPoints.friends, gd.endPoints.friendRequests].some(item => item === fileName)){
            data = woof.properties(properties.players, data.split(gd.coms[0])[0].split(gd.coms[1]), gd.coms[2]);
        }else if ([gd.endPoints.leaderboardLevels].some(item => item === fileName)){
            data = woof.properties(properties.leaderboardLevels, data.split(gd.coms[0])[0].split(gd.coms[1]), gd.coms[2]);
        }else if ([gd.endPoints.messages, gd.endPoints.downloadMessage].some(item => item === fileName)){
            data = woof.properties(properties.messages, data.split(gd.coms[0])[0].split(gd.coms[1]), gd.coms[2], function(item){
                item.subject = Buffer.from(item.subject, "base64").toString("utf-8");
                if (typeof item.message === "string"){
                    item.message = woof.decrypt(item.message, 14251);
                };
            });
        }else if ([gd.endPoints.levelSearch].some(item => item === fileName)){
            data = data.split(gd.coms[0]);

            /**
             * @Analysis fun little thing for a player's created levels statistics
             * @Missing legendaries (2.2 addition)
             */

            let returnValue = {levels: data[0].split(gd.coms[1]), users: {}, songs: woof.properties(properties.songs, data[2].split(gd.coms[5]), gd.coms[6]), stats: {
                0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
                levels: 0, unrates: 0, rates: 0, features: 0, epics: 0, legendaries: 0,
                downloads: 0, likes: 0, orbs: 0, stars: 0, ucoinsVerified: 0, ucoinsUnverified: 0
            }};

            data[1].split(gd.coms[1]).map(user => {
                if (typeof user === "string"){
                    user = user.split(gd.coms[2]);
                    returnValue.users[user[0]] = {username: user[1], accountID: user[2]};
                };
            });

            data[3] = data[3].split(gd.coms[2]);
            returnValue.info = {
                total: data[3][0],
                perPage: data[3][1],
                page: data[3][2]
            };

            returnValue.levels = woof.properties(properties.levels, returnValue.levels, gd.coms[2], function(lvl){
                let foundSong = +lvl.song > 0 ? returnValue.songs.find(song => song.id === lvl.song) : gd.mainSongs[lvl.songMain];
                lvl.song = typeof foundSong === "object" ? foundSong : {};
                lvl.username = returnValue.users[lvl.playerID] === undefined ? null : returnValue.users[lvl.playerID].username;
                lvl.accountID = returnValue.users[lvl.playerID] === undefined ? null : returnValue.users[lvl.playerID].accountID;
                lvl.username = typeof lvl.username === "string" ? lvl.username : "-";
                lvl.accountID = +lvl.accountID > 0 ? lvl.accountID: null;
                lvl.orbs = gd.rates.orbs[lvl.stars];
                lvl.description = typeof lvl.description === "string" ? lvl.description.length > 0 ? Buffer.from(lvl.description, "base64").toString("utf-8") : "" : "";

                returnValue.stats.levels++;
                returnValue.stats[lvl.stars]++;
                ["orbs", "likes", "stars", "downloads"].map(key => {
                    returnValue.stats[key] = +lvl[key]+returnValue.stats[key];
                });
                returnValue.stats[+lvl.ucoinsVerified ? "ucoinsVerified" : "ucoinsUnverified"] = returnValue.stats[+lvl.ucoinsVerified ? "ucoinsVerified" : "ucoinsUnverified"]+Number(lvl.ucoins);

                if (+lvl.epic){
                    returnValue.stats.epics++;
                }else if (+lvl.featureScore > 0){
                    returnValue.stats.features++;
                }else if (+lvl.stars > 0){
                    returnValue.stats.rates++;
                }else{
                    returnValue.stats.unrates++;
                };

                lvl.difficultyEmote = woof.getRate(1, lvl);
            });

            returnValue = {levels: returnValue.levels, stats: returnValue.stats};
            data = returnValue;
        }else if ([gd.endPoints.downloadLevel].some(item => item === fileName)){
            data = woof.properties(properties.levels, data.split(gd.coms[0])[0], gd.coms[2], function(lvl){
                lvl.highDetail = +lvl.objects > 40000 ? 1 : 0;
                lvl.password = +lvl.password === 0 ? "0" : woof.decrypt(lvl.password, 26364).toString();
                lvl.password = ["0", "1"].some(key => key === lvl.password) ? ["not copyable", "free"][lvl.password] : lvl.password.slice(1, lvl.password.length);
                lvl.orbs = gd.rates.orbs[lvl.stars];
                lvl.description = Buffer.from(lvl.description, 'base64').toString("utf-8");
                lvl.data = pako.inflate(Buffer.from(lvl.data, 'base64'), {to:"string"}).toString("utf-8").split(gd.coms[7]);
                lvl.ucoinsObjects = [];
                
                let objs = woof.properties(properties.objects, lvl.data.slice(1, lvl.data.length).filter(item => typeof item === "string" ? item.length > 0 : false), gd.coms[8], function(obj){
                    if (typeof obj.groups === "string"){obj.groups = obj.groups.split(gd.coms[9]);};
                    if (obj.id === "1329"){
                        lvl.ucoinsObjects.push(obj);
                    };
                }), returnValue = {};

                objs.map(obj => {
                    obj.percentage = isNaN(+obj.x) ? 0 : (+(100*Number(obj.x)/(Math.max(Number(objs[objs.length-1].x), gd.levels.defaultSize)+gd.levels.endingSize)).toFixed(2));
                });
                lvl.data = {
                    k: woof.properties(properties.k, lvl.data[0], gd.coms[8])[0],
                    objects: objs
                };

                lvl.data.k = lvl.data.k === undefined ? {} : lvl.data.k;

                if (!(lvl.data.k.colors === undefined)){
                    woof.properties(properties.colors, lvl.data.k.colors.split(gd.coms[1]), gd.coms[10], function(col){
                        col.name = woof.objectReverse(gd.colorNames)[col.channel];
                        col.name = col.name === undefined ? null : col.name;
                    }).map(col => {
                        returnValue[col.channel] = col;
                    });
                    lvl.data.k.colors = returnValue;
                };

                lvl.difficultyEmote = woof.getRate(1, lvl);
            });
        }else if ([gd.endPoints.mapPacks].some(item => item === fileName)){
            data = {
                packs: woof.properties(properties.mapPacks, data.split(gd.coms[0])[0].split(gd.coms[1]), gd.coms[2], function(pack){
                    ["levels", "colorTitle", "colorBar"].map(key => {
                        pack[key] = typeof pack[key] === "string" ? pack[key].split(gd.coms[8]) : [];
                    });
                })
            };
        }else if ([gd.endPoints.gauntlets].some(item => item === fileName)){
            data = {
                gauntlets: woof.properties(properties.gauntlets, data.split(gd.coms[0])[0].split(gd.coms[1]), gd.coms[2], function(gauntlet){
                    ["levels"].map(key => {
                        gauntlet[key] = typeof gauntlet[key] === "string" ? gauntlet[key].split(gd.coms[8]) : [];
                    });
                })
            };
        }else if ([gd.endPoints.commentsAccount, gd.endPoints.commentsHistory, gd.endPoints.commentsLevel].some(item => item === fileName)){
            /**
             * @Analysis fun little thing for a player's comments statistics
             */
            
            let localAnalysis = {levels: [], likes: 0};

            data = {
                messages: data.split(gd.coms[0])[0].split(gd.coms[1]).map(msg => {
                    msg = msg.split(gd.coms[2]);
                    msg = {
                        message: woof.properties(properties.cmts, msg[0], gd.coms[3], function(cmt){
                            cmt.flagged = +cmt.likes <= -4 ? 1 : 0;
                            cmt.message = typeof cmt.message === "string" ? Buffer.from(cmt.message, 'base64').toString("utf-8") : "";
                            if(localAnalysis.levels.find(item => item === cmt.levelID) === undefined && !isNaN(Number(cmt.levelID))) localAnalysis.levels.push(cmt.levelID);
                            if (!isNaN(Number(cmt.likes))) localAnalysis.likes += +cmt.likes;
                        })[0],
                        player: woof.properties(properties.players, msg[1], gd.coms[3], function(cmt){})
                    };
                    msg.player = Array.isArray(msg.player) ? msg.player[0] : {};
                    Object.keys(msg.player).map(key => {
                        msg.message[key] = msg.player[key];
                    });
                    return msg.message;
                }).filter(item => typeof item === "object" && !(item === undefined)),
                analysis: localAnalysis
            };

            data.analysis.levels = data.analysis.levels.length;
        };
        data = Array.isArray(data) && getFirst ? data[0] : data;
    }else{
        data = -1;
    };

    return data;
};

/**
 * @Description Get data from Geometry Dash's API
 */

function gdFetch(execute, conditions, fileName, getFirst){
    conditions = typeof conditions === "object" ? conditions : {};
    conditions["gameVersion"] = "21";
    conditions["binaryVersion"] = "35";
    conditions["gdw"] = conditions["gdw"] === undefined ? "0" : "1";
    conditions["secret"] = gd.secret;
    
    return new Promise((res, err) => {
        fetch(gd.database.replace(`~0~`, fileName), {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded', "User-Agent": ""},
            body: Object.keys(conditions).map(key => {if (!(key === "ulSpecial")){return `${key}=${conditions[key]}`}}).filter(item => typeof item === "string").join("&"),
        })
        .then(res => {
            if (res.status >= 400){throw new Error("Bad response from server");};
            return res.text();
        })
        .then(data => {
            data = dataTranslate(fileName, data, conditions, getFirst);

            if (typeof execute === 'function') execute(data);
            if (typeof res === 'function') res(data);
        })
        .catch(err => {if (typeof execute === 'function') execute(-2);});
    });
};

module.exports = {
    getGJPlayers(user, execute){
        return gdFetch(execute, {str: user}, gd.endPoints.players, 1);
    },

    getGJAccount(id, execute){
       return gdFetch(execute, {targetAccountID: id}, gd.endPoints.accounts, 1);
    },

    async playerToAccount(user, execute){
        let player = await this.getGJPlayers(user);

        if (+player < 0) {
            if (typeof execute === 'function') execute(player);
            return player;
        };

        player = await this.getGJAccount(player.accountID);

        if (typeof execute === 'function') execute(player);
        return player;
    },

    getGJLevels(input, conditions, execute){
        conditions.str = input;
        return gdFetch(execute, conditions, gd.endPoints.levelSearch);
    },

    getGJMapPacks(conditions, execute){
        return gdFetch(execute, conditions, gd.endPoints.mapPacks, 1);
    },

    getGJMessages(conditions, execute){
        conditions.accountID = private.woofBot.accountID;
        conditions.gjp = private.woofBot.gjp;
        return gdFetch(execute, conditions, gd.endPoints.messages);
    },

    getCommentsAccount(id, conditions, execute){
        conditions.accountID = id;
        return gdFetch(execute, conditions, gd.endPoints.commentsAccount);
    },
    
    getCommentsLevel(id, conditions, execute){
        conditions.levelID = id;
        conditions.mode = +conditions.mode > 0 ? +conditions.mode : 0;
        return gdFetch(execute, conditions, gd.endPoints.commentsLevel);
    },

    getCommentsHistory(playerID, conditions, execute){
        conditions.userID = playerID;
        conditions.mode = 0;
        return gdFetch(execute, conditions, gd.endPoints.commentsHistory);
    },

    getLeaderboardStats(conditions, execute){
        conditions.type = typeof conditions.type === "string" ? conditions.type.toLowerCase() === "creators" ? conditions.type.toLowerCase() : "top" : "top";
        return gdFetch(execute, conditions, gd.endPoints.leaderboardStats);
    },

    getLeaderboardLevel(id, conditions, execute){
        conditions.levelID = id;
        conditions.type = conditions.type === 2 ? 2 : 1;
        conditions.accountID = private.woofBot.accountID;
        conditions.gjp = private.woofBot.gjp;
        return gdFetch(execute, conditions, gd.endPoints.leaderboardLevels);
    },

    downloadLevel(id, execute){
        return gdFetch(execute, {levelID: id}, gd.endPoints.downloadLevel, 1);
    },

    downloadMessage(id, execute){
        return gdFetch(execute, {messageID: id, accountID: private.woofBot.accountID, gjp: private.woofBot.gjp}, gd.endPoints.downloadMessage, 1);
    },

    async getDaily(execute){
        let lvl = await this.downloadLevel(-1);
        if (typeof execute === 'function') execute(lvl);
        return lvl;
    },

    async getWeekly(execute){
        let lvl = await this.downloadLevel(-2);
        if (typeof execute === 'function') execute(lvl);
        return lvl;
    },

    getGauntlet(gauntlet, execute){
        return gdFetch(execute, {gauntlet: gauntlet}, gd.endPoints.levelSearch);
    },

    getGauntlets(execute){
        return gdFetch(execute, {}, gd.endPoints.gauntlets);
    },

    uploadCommentAccount(message, execute){
        if (typeof message === "string") return gdFetch(execute, {cType: 1, comment: woof.b64to(message), accountID: private.woofBot.accountID, userName: private.woofBot.username, gjp: private.woofBot.gjp}, gd.endPoints.uploadCommentAccount);
        return null;
    },

    uploadCommentLevel(message, idLevel, percentage=0, execute){
        if (typeof message === "string"){
            percentage = +percentage > 0 ? Math.floor(+percentage) : 0;
            return gdFetch(execute, {percent: percentage, levelID: idLevel, comment: woof.b64to(message), accountID: private.woofBot.accountID, userName: private.woofBot.username, gjp: private.woofBot.gjp, chk: woof.encrypt(woof.sha1((private.woofBot.username.toString())+(woof.b64to(message).toString())+(idLevel.toString())+(percentage.toString())+"0xPT6iUrtws0J"), 29481)}, gd.endPoints.uploadCommentLevel);
        };
        return null;
    },

    deleteCommentAccount(idComment, execute){
        return gdFetch(execute, {cType: 1, commentID: idComment, accountID: private.woofBot.accountID, gjp: private.woofBot.gjp}, gd.endPoints.deleteCommentAccount);
    },

    deleteCommentLevel(idComment, idLevel, execute){
        return gdFetch(execute, {commentID: idComment, levelID: idLevel, accountID: private.woofBot.accountID, gjp: private.woofBot.gjp}, gd.endPoints.deleteCommentLevel);
    },

    getFriends(conditions, execute){
        conditions.type = +conditions.type > 0 ? +conditions.type : 0;
        conditions.accountID = private.woofBot.accountID;
        conditions.gjp = private.woofBot.gjp;
        return gdFetch(execute, conditions, gd.endPoints.friends);
    },

    getFriendRequests(conditions, execute){
        conditions.accountID = private.woofBot.accountID;
        conditions.gjp = private.woofBot.gjp;
        return gdFetch(execute, conditions, gd.endPoints.friendRequests);
    },

    convertTime(input) {
        if (typeof input === "string") {
            input = input.includes(" year") ? 365*Number(input.toString().split(" ")[0])+" day" : input;
            input = input.includes(" month") ? 30*Number(input.toString().split(" ")[0])+" day" : input;
            input = input.includes(" week") ? 7*Number(input.toString().split(" ")[0])+" day" : input;
            input = input.includes(" day") ? 24*Number(input.toString().split(" ")[0])+" hour" : input;
            input = input.includes(" hour") ? 60*Number(input.toString().split(" ")[0])+" minute" : input;
            input = input.includes(" minute") ? 60*Number(input.toString().split(" ")[0])+" second" : input;
            input = input.includes(" second") ? 1000*Number(input.toString().split(" ")[0]) : input;
        };
        return input;
    },

    settings: gd,
    levelsMain: levelsMain(),
};

Object.keys(apiHidden).map(key => {
    module.exports[key] = apiHidden[key];
});
