module.exports = function (input, encode, removeEnd, isDiscordText){
    let returnValue = input;

    if (typeof input === "string" ? input.length > 0 : false){
        if (encode){
            input = Buffer.from(input, "utf-8").toString("base64");
            if (removeEnd){
                while (input.endsWith("=")){
                    input = input.substr(0, input.length-1);
                };
            };
            if (isDiscordText){
                while (input.includes("+")){
                    input = input.replace("+", "_plus_");
                };
                while (input.includes("/")){
                    input = input.replace("/", "_slfr_");
                };
            };
        }else{
            if (isDiscordText){
                while (input.includes("_plus_")){
                    input = input.replace("_plus_", "+");
                };
                while (input.includes("_slfr_")){
                    input = input.replace("_slfr_", "/");
                };
            };
            while (input.length%4 > 0){
                input += "=";
            };
            input = Buffer.from(input, "base64").toString("utf-8");
        };
    };

    return input;
};