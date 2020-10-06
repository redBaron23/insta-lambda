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
    console.log("Botardos",botardos)
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
    //console.log("El bot", bots);
    let bot, fish, nextCursor, followers, followersNextCursor;

    bot = bots[0];
    fish = fishes[0];

    //Arranca
    console.log("ashanca")
    followers = fish.followers;
    console.log("El fish", fish)

    console.log("El fish", followers.length)
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
        const [followers, followersNextCursor] = await getFollowers(fish.userName, bot.cookies, nextCursor);

        fish.followers = followers;
        fish.nextCursor = followersNextCursor;

        await saveFish(fish);
        console.log("Los seguidores", followers.length);
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
        console.log(data);
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
