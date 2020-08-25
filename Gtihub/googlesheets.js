const settings = require("./libraries/settings.json");
const woof = require("./libraries/extensions.js");
const {GoogleSpreadsheet} = require("google-spreadsheet");
const sheets = settings.sheets;

async function getTab(doc, id){
    await doc._rawSheets[id]
    return doc._rawSheets[id]
}

async function loadCells(localDoc, tab, cells){
    await localDoc._rawSheets[tab].loadCells(cells);
}

async function saveUpdatedCells(tab){
    await tab.saveUpdatedCells();
}

async function rows(doc, id){
    await doc._rawSheets[id].getRows();
    return doc._rawSheets[id].getRows();
}

async function addRows(rowObject, tab){
    rowObject = (Array.isArray(rowObject) ? rowObject : [rowObject]).filter(item => typeof item === "object" && !(item === undefined) && !(item === null));
    if (rowObject.length > 0){
        await tab.addRows(rowObject);
    };
}

function listRawSheets(theDoc){
    let returnValue = {};
    if (typeof theDoc === "object"){
        Object.keys(theDoc._rawSheets).map(id => {
            returnValue[id] = theDoc._rawSheets[id]._rawProperties.title;
        });
    };
    console.log(returnValue);
}

async function doc(link){
    link = new GoogleSpreadsheet(link);
    link.useServiceAccountAuth(require('./client_secret.json'));
    await link.loadInfo();
    return link;
}

function headerColumns(headers) {
    let returnValue = {};

    (Array.isArray(headers) ? headers : []).map((key, i) => {
        let codes = [], max = 26;

        codes.push(i);

        while (codes.some(item => item >= max)) {
            let localIndex = codes.findIndex(item => item >= max);
            codes[localIndex] = codes[localIndex]-max;
            codes[localIndex+1] = codes[localIndex+1] == null ? 0 : codes[localIndex+1]+1;
        };

        /*if ([0, headers.length-1].some(item => item === i))*/
        returnValue[key] = String.fromCharCode(...codes.reverse().map(item => {return item+65}));
    });

    return returnValue;
}

/////////////////////////////////////
function tabIDToObject(tab){
    let returnValue = JSON.parse(JSON.stringify(sheets[Object.keys(sheets).find(sheet => Object.keys(sheets[sheet].tabs).find(localTab => sheets[sheet].tabs[localTab].id === tab.id))]));
    if (typeof returnValue === "object"){
        returnValue.tab = tab;
    };
    return typeof returnValue === "object" ? returnValue : {};
};

function loadSheetTab(tab, conditions={}, execute){
    if (typeof execute === "function"){
        let localSheet = tabIDToObject(tab);
        localSheet.id = localSheet.link;
        localSheet.link = typeof localSheet.link === "string" ? settings.links.googlesheet+localSheet.link : localSheet.link;

        woof.groups("type:1:count:1:page:1".split(":"), 2, 1).map(key => {
            if (key[1] === "1"){
                conditions[key[0]] = Number(conditions[key[0]]) > 0 ? Number(conditions[key[0]]) : 0;
            };
            localSheet[key[0]] = conditions[key[0]];
        });

        doc(localSheet.id).then(localDoc => {
            localSheet.doc = localDoc;
            getTab(localDoc, tab.id).then(localTab => {
                localSheet.tab = localTab;
                if (conditions.type === 0){
                    execute(localSheet);
                }else if (conditions.type === 1){
                    rows(localDoc, tab.id).then(rows => {
                        localSheet.rows = isNaN(localSheet.count) || localSheet.count === 0 ? rows : rows.slice(localSheet.count*localSheet.page, localSheet.count*(localSheet.page+1));
                        execute(localSheet);
                    });
                }else if (conditions.type === 2){
                    loadCells(localDoc, tab.id, "B69:H70").then(loaded => {
                        execute(loadedCells);
                    });
                }else if (conditions.type === 3){
                    rows(localDoc, tab.id).then(rows => {
                        localSheet.rows = isNaN(localSheet.count) || localSheet.count === 0 ? rows : rows.slice(localSheet.count*localSheet.page, localSheet.count*(localSheet.page+1));
                        // add loadCellsPart
                        execute(localSheet);
                    });
                };
            });
        });
    };
};

async function loadTabs(localDoc, tabs, execute){
    localDoc = typeof localDoc === 'string' ? await doc(localDoc) : localDoc;
    let returnValue = {}, keys = Object.keys(tabs), counter = 0;

    async function loader(){
        localDoc._rawSheets[tabs[keys[counter]]].getRows().then(row => {
            returnValue[keys[counter]] = row;
            counter++;
            if (keys[counter] == null){
                execute(returnValue);
            }else{
                loader();
            }
        })
    }
    if (keys[counter] == null) return returnValue;
    loader();
}

/////////////////////////////////////

module.exports = {
    loadSheetTab: loadSheetTab,
    doc: doc,
    rows: rows,
    addRows: addRows,
    loadTabs: loadTabs,
    headerColumns: headerColumns
};