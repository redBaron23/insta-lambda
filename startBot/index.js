const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });



const famousUserNames = ["instagram", "cristiano", "arianagrande", "therock", "kyliejenner", "selenagomez", "kimkardashian", "leomessi", "beyonce", "neymarjr", "justinbieber", "natgeo", "taylorswift", "kendalljenner", "jlo", "nickiminaj", "nike", "khloekardashian", "mileycyrus", "katyperry", "kourtneykardash", "kevinhart4real", "theellenshow", "realmadrid", "fcbarcelona", "ddlovato", "badgalriri", "zendaya", "victoriassecret", "iamcardib", "champagnepapi", "shakira", "chrisbrownofficial", "kingjames", "vindiesel", "billieeilish", "virat.kohli", "davidbeckham", "championsleague", "nasa", "justintimberlake", "emmawatson", "shawnmendes", "gigihadid", "priyankachopra", "9gag", "ronaldinho", "maluma", "camilacabello", "deepikapadukone", "nba", "aliaabhatt", "shraddhakapoor", "Anita", "marvel", "dualipa", "snoopdogg", "robertdowneyjr", "willsmith", "Jamesrodriguez10", "marcelotwelve", "hudabeauty", "caradelevingne", "leonardodicaprio", "nikefootball", "garethbale11", "zlatanibrahimovic", "chrishemsworth", "narendramodi", "zacefron", "ladygaga", "jacquelinef143", "raffinagita1717", "whinderssonnunes", "5.min.crafts", "tatawerneck", "paulpogba", "jbalvin", "ayutingting92", "lelepons", "k.mbappe", "akshaykumar", "gucci", "Juventus", "chanelofficial", "daddyyankee", "michelleobama", "zara", "gal_gadot", "nehakakkar", "natgeotravel", "sergioramos", "vanessahudgens", "mosalah", "katrinakaif", "paulodybala", "premierleague", "louisvuitton", "anushkasharma", "luissuarez9"]


const startBot = async(userName, password, type, unfollowers, ratio, bigFish) => {

    let res, bot;
    bot = {};
    res = "Something went wrong";
    const user = await getUser(userName);


    //Si la contraseña es correcta agregamos el bot
    //Static es que sigue siempre a los mismos y deja de seguirlos
    //Dynamic los sigue, deja de seguir y nv en disney
    if (user.password === password && type) {
        bot.type = type;
        bot.userName = user.userName;
        bot.cookies = user.cookies;
        bot.status = "enabled";


        if (unfollowers) {
            bot.unfollow = unfollowers;
            bot.follow = [];
            bot.action = "unfollow";
        }
        else { //Dynamic o static
            if (type === "static") {//Este es el de los famosos
                bot.follow = famousUserNames;
            }
            else {//ESte es el que le doy un usuario con seguidores y ratio
                bot.ratio = ratio;
                bot.follow = await getFans("psicologia_memes");
                //Si agrego el fish aca, cada x tiempo tengo que agregarle sus seguidores
                bot.bigFish = bigFish;
            }
            bot.unfollow = [];
            bot.action = "follow";
        }
        console.log(bot);
        await saveBot(bot);
        res = "Bot created";
    }
    else {
        throw ("Incorrect password");
    }
    return res;
}


const getFans = async(userName) => {
    let user = "psicologia_memes"
    //ToDo llamar a la tabla fans y agarrar algunos
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const params = {
        TableName: "Fans",
        Key: {
            userName: user
        }
    }

    const data = await documentClient.get(params).promise();
    if (!data.Item) throw "User not found";
    console.log(data.Item.followers);
    return data.Item.followers;
}


const saveBot = async(item) => {



    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const params = {
        TableName: "Bot",
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


const getUser = async(userName) => {


    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const params = {
        TableName: "Users",
        Key: {
            userName: userName
        }
    }

    const data = await documentClient.get(params).promise();
    if (!data.Item) throw "User not found";
    console.log("User", data.Item);
    return data.Item;
}

exports.handler = async(event) => {
    // TODO implement
    // Agregar bigFish a fans, y hacer que se complete, y suscriba
    //El bot a dicho item de fans



    let userName, password, req, bigFish, ratio, response, type, cookies, errMessage, unfollowers;

    console.log("Login Event", event)


    req = (event.httpMethod === "POST") ? JSON.parse(event.body) : event

    if (req.password && req.userName) {

        userName = req.userName;
        password = req.password;
        type = req.type;
        unfollowers = req.unfollowers;
        ratio = req.ratio;
        bigFish = req.bigFish

        console.log("Data", userName, password, type, bigFish);


        try {
            const status = await startBot(userName, password, type, unfollowers, ratio);

            console.log("RES", status);


            response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(cookies),
            };
        }
        catch (e) {
            console.log("Error en startBot", e)
            response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(e.code),
            };
        }

    }
    else {
        errMessage = "Need userName and password"
        response = {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(errMessage),
        };
    }









    return response;
};
