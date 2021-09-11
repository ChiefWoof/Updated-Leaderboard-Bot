const base64 = require("../Extensions/base64");
const properties = require("../Util/properties");

function objectReverse(mapKey) {
    let returnValue = {};

    if (typeof mapKey === "object") Object.keys(mapKey).map(key => { returnValue[mapKey[key]] = key; });
    
    return returnValue;
}

function groups(input, divisions, cutOff) {
    input = [[], Array.isArray(input) ? input : []];

    for (i = 0; i < input[1].length; i += divisions) input[0].push(input[1].slice(i, i+divisions));
    
    return cutOff ? input[0].filter(item => item.length === divisions) : input[0];
}

function dataTranslate(mapKey, input, separator, executeAfter){
    let getAlter = mapKey === properties.properties ? 1 : 0;
    
    if ((Array.isArray(input) || typeof input === "string") && typeof separator === "string"){
        mapKey = objectReverse(mapKey);
        input = Array.isArray(input) ? input : [input];
        return input.map(item => {
            let returnValue = {};
            groups(item.split(separator), 2, 1).map(key => {
                if (!(mapKey[key[0]] === undefined) && !(key[1] === undefined)){
                    if (getAlter){
                        if (properties.propertyArrays.some(item => Number(key[0]) === item)){
                            key[1] = key[1].split(properties.propertyComs[4]);
                        }else if (properties.propertyNums.some(item => Number(key[0]) === item)){
                            key[1] = Number(key[1])
                        }else if (properties.propertyBases.some(item => Number(key[0]) === item)){
                            key[1] = base64(key[1]);
                        };
                    };
                    returnValue[mapKey[key[0]]] = key[1];
                };
            });
            if (Object.keys(returnValue).length > 0){
                if (typeof executeAfter === "function"){
                    executeAfter(returnValue);
                };
                return returnValue;
            };
        }).filter(item => typeof item === "object");
    }else if (typeof input === "object" && !(input === undefined) && !(Array.isArray(input))){
        return Object.keys(mapKey).map(key => {
            if (!(mapKey[key] === undefined) && !(input[key] === undefined)){
                if (getAlter){
                    if (properties.propertyArrays.some(item => Number(mapKey[key]) === item)){
                        input[key] = input[key] = Array.isArray(input[key]) ? input[key].join(properties.propertyComs[4]) : input[key];
                    }else if (properties.propertyBases.some(item => Number(mapKey[key]) === item)){
                        input[key] = base64(input[key], 1, 1);
                    };
                };
                return [mapKey[key], input[key]].join(separator);
            };
        }).filter(item => typeof item === "string" ? item.length > 0 : false).join(separator);
    };
}

function getItemsWithProperty(mapKey, input, getItem, separator){
    let returnValue = [], reverseKey = objectReverse(mapKey);
    getItem = Array.isArray(getItem) ? getItem : [getItem];

    if (typeof input === "object"){
        Object.keys(input).map(key => {
            let localKey = {};

            if (typeof input[key] != "string") return;

            key = dataTranslate(mapKey, input[key], separator);
            key = Array.isArray(key) ? key[0] : {};
            
            getItem.map(item => { if (!(key[reverseKey[item]] === undefined)) localKey[item] = (key[reverseKey[item]]); });
            
            if (Object.keys(localKey).length > 0) returnValue.push(localKey);
        });
    };

    return returnValue;
}

module.exports = {
    groups: groups,
    objectReverse: objectReverse,
    dataTranslate: dataTranslate,
    getItemsWithProperty: getItemsWithProperty
}
