const AWS = require("aws-sdk");


AWS.config.update({ region: "us-east-1" });

const lambda = new AWS.Lambda({ region: "us-east-1" });



const getBots = async() => {
    let botardos;
    console.log("Dynamo");
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    var params = {
        TableName: "Users",
        Key: {
            slave: true
        }
    };
    const bots = await documentClient.scan(params).promise();

    botardos = bots.Items.filter(i => i.slave);
    console.log("Botardos", botardos)
    return botardos
}


const getFishes = async() => {

    console.log("Dynamo");
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    var params = {
        TableName: "Fans"
    };

    const bots = await documentClient.scan(params).promise();
    return bots.Items
}

const start = async(bots, fishes) => {


    await Promise.all(fishes.map(async(fish) => {
        //console.log("El bot", bots);
        let bot, botNumber, nextCursor, followersNextCursor;
        let followers = [];
        //Bot a usar random
        botNumber = Math.floor(Math.random() * bots.length);
        console.log("Bot number", botNumber)
        bot = bots[botNumber];
        console.log("Bot ", bot)


        //Arranca
        console.log("ashanca")
        if (fish.followers) followers = fish.followers;
        console.log("El fish", fish)

        console.log("Fish followers length", followers.length,"nombre",fish.userName,"next",fish.nextCursor)
        if (followers.length && fish.nextCursor) {
            let newFollowers;
            //Ya tiene elementos y no esta lleno
            console.log("Si");
            [followers, followersNextCursor] = await getFollowers(fish.userName, bot.cookies, fish.nextCursor);
            newFollowers = [...fish.followers, ...followers]
            fish.followers = newFollowers;
            fish.nextCursor = followersNextCursor;
            await saveFish(fish);
        }
        else {
            //Cargamos por primera vez
            //ToDo Hay que enviarle los followers al que lo pidio
            const [followers, followersNextCursor] = await getFollowers(fish.userName, bot.cookies, nextCursor);

            fish.followers = followers;
            fish.nextCursor = followersNextCursor;

            await saveFish(fish);
            await saveBot(fish.suscriber, followers);
            console.log("Los seguidores", followers.length);
        }
    }));

}

const getBot = async(userName) => {
    //ToDo llamar a la tabla fans y agarrar algunos
    let data, params;
    let response = [];
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });


    params = {
        TableName: "Bot",
        Key: {
            userName: userName
        }
    }

    data = await documentClient.get(params).promise();

    response = data.Item;

    console.log("LA data", response)

    return response;
}


const saveBot = async(userName, followers) => {

    let bot;
    
    bot = await getBot(userName);
    bot.follow = followers;
    bot.status = "enabled";
    
    console.log("userName", userName);
    console.log("followers", followers);
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const params = {
        TableName: "Bot",
        Item: bot
    }

    try {
        const data = await documentClient.put(params).promise();
        console.log("DATITATATATATA", data);
    }
    catch (err) {
        console.log(err);
    }

}

const saveFish = async(item) => {



    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const params = {
        TableName: "Fans",
        Item: item
    }

    try {
        const data = await documentClient.put(params).promise();
    }
    catch (err) {
        console.log(err);
    }

}


const getFollowers = async(userName, cookies, nextPage) => {

    const nextCursor = (nextPage) ? nextPage : "";
    return await new Promise((resolve, reject) => {
        const params = {
            FunctionName: "cloud9-insta-bot-node-followers-1K7LJLPSTZFC2",
            Payload: JSON.stringify({
                userName,
                cookies,
                nextCursor
            }),
        };

        lambda.invoke(params, (err, results) => {
            if (err) reject(err);
            else {
                console.log("getFollowers RES", results)

                const json = JSON.parse(results.Payload) //JSON.parse(results.Payload);
                console.log("getFollowers", json);
                const body = JSON.parse(json.body);
                resolve([body.followers, body.nextCursor])
            };
        });
    });
};


exports.handler = async(event) => {
    // TODO implement
    //Reprogramar proxima ejecucion en #0


    console.log("Update bot", event);

    let bots, errMessage, fishes;
    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    try {

        bots = await getBots();
        fishes = await getFishes();
        await start(bots, fishes);

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
