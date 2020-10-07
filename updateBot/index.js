const axios = require('axios');
const AWS = require("aws-sdk");


AWS.config.update({ region: "us-east-1" });

const lambda = new AWS.Lambda({ region: "us-east-1" });
//const helper = require("../fun/helper")



const follow = async(userName, cookies, ratio) => {
    console.log("Follow", userName);

    return await new Promise((resolve, reject) => {
        const params = {
            FunctionName: "cloud9-insta-bot-node-follow-117UD4Q03TFEA",
            Payload: JSON.stringify({
                userName,
                cookies,
                ratio
            }),
        };

        lambda.invoke(params, (err, results) => {
            if (err) reject(err);
            else {
                const res = JSON.parse(results.Payload);

                resolve(res.body)

            };
        });
    });
};

const unfollow = async(userName, cookies) => {
    console.log("unfollow", userName);


    return await new Promise((resolve, reject) => {
        const params = {
            FunctionName: "cloud9-insta-bot-node-unfollow-16E6PM8EHSVDU",
            Payload: JSON.stringify({
                userName,
                cookies,
            }),
        };

        lambda.invoke(params, (err, results) => {
            if (err) reject(err);
            else {
                const res = JSON.parse(results.Payload);
                const status = (res.statusCode) ? true : false;
                resolve(status)
            };
        });
    });
};




const getBots = async() => {

    console.log("Dynamo");
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    var params = {
        TableName: "Bot"
    };

    const bots = await documentClient.scan(params).promise();
    return bots.Items
}





const start = async(bots) => {
    await Promise.all(bots.map(async(bot) => {

        if (bot.status === "enabled") {

            let userName, cookies, status;

            console.log(bot);
            cookies = bot.cookies;
            if (bot.action === "follow") {
                userName = bot.follow.pop();
                status = await follow(userName, cookies, bot.ratio);
                console.log("_____________El status", status)
                //Static = sigue siempre a los mismos. Dynamic, los sigue, los deja de seguir y ahi queda

                //Solo lo dejo de seguir si es el status que bussco
                if (status === "ok") bot.unfollow.push(userName);
                if (bot.follow.length === 0) bot.action = "unfollow"
            }
            else {
                //el action es unfollow


                userName = bot.unfollow.pop();
                status = await unfollow(userName, cookies);
                console.log("El status", status)
                console.log("user", userName)
                //Si es el farm famous, lo agrega a la lista de seguir
                if ((status) && (bot.type === "static"))
                    bot.follow.push(userName);

                //Si es el farm famous = static sigue la rutina, sino se da por concluido el bot
                console.log("El tipo deberia ser static y es", bot.type);
                console.log("La cantidad de unfollow deberia ser 0 para parar y es", bot.unfollow.length);
                console.log("Aca la bot status es", bot.status);
                //Si es static nunca se apaga

                if ((bot.type === "static") && (bot.unfollow.length === 0)) bot.action = "follow";
                if ((bot.type === "dynamic") && (bot.unfollow.length === 0)) bot.status = "disabled";


                console.log("Entonces la bot status es", bot.status)

            }

            console.log("unfollow", bot.unfollow)
            await saveBot(bot);
        }


    }));
}




const saveBot = async(bot) => {

    console.log("Bot guardado", bot);


    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const params = {
        TableName: "Bot",
        Item: bot
    }

    try {
        const data = await documentClient.put(params).promise();
        console.log(data);
    }
    catch (err) {
        console.log(err);
    }

}



exports.handler = async(event) => {
    // TODO implement
    //Reprogramar proxima ejecucion en #0


    console.log("Update bot", event);

    let bots, errMessage;
    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    try {

        bots = await getBots();
        await start(bots);

        //#0

        errMessage = "Todo ok"
        response.statusCode = 200
        response.body = JSON.stringify(errMessage)
    }
    catch (e) {
        console.log("Hubo un error", e)
        errMessage = "Hubo un error"
        response.statusCode = 500
        response.body = JSON.stringify(errMessage)
    }




    console.log("My respuesta", response);
    return response;
};
