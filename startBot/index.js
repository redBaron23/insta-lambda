const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });



const famousUserNames = ["instagram","cristiano","arianagrande","therock","kyliejenner","selenagomez","kimkardashian","leomessi","beyonce","neymarjr","justinbieber","natgeo","taylorswift","kendalljenner","jlo","nickiminaj","nike","khloekardashian","mileycyrus","katyperry","kourtneykardash","kevinhart4real","theellenshow","realmadrid","fcbarcelona","ddlovato","badgalriri","zendaya","victoriassecret","iamcardib","champagnepapi","shakira","chrisbrownofficial","kingjames","vindiesel","billieeilish","virat.kohli","davidbeckham","championsleague","nasa","justintimberlake","emmawatson","shawnmendes","gigihadid","priyankachopra","9gag","ronaldinho","maluma","camilacabello","deepikapadukone","nba","aliaabhatt","shraddhakapoor","Anita","marvel","dualipa","snoopdogg","robertdowneyjr","willsmith","Jamesrodriguez10","marcelotwelve","hudabeauty","caradelevingne","leonardodicaprio","nikefootball","garethbale11","zlatanibrahimovic","chrishemsworth","narendramodi","zacefron","ladygaga","jacquelinef143","raffinagita1717","whinderssonnunes","5.min.crafts","tatawerneck","paulpogba","jbalvin","ayutingting92","lelepons","k.mbappe","akshaykumar","gucci","Juventus","chanelofficial","daddyyankee","michelleobama","zara","gal_gadot","nehakakkar","natgeotravel","sergioramos","vanessahudgens","mosalah","katrinakaif","paulodybala","premierleague","louisvuitton","anushkasharma","luissuarez9"]


const startBot = async(userName, password, type) => {
    
    let res,bot;
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
        bot.action = "follow";
        bot.unfollow = [];
        bot.follow = (type === "static") ? famousUserNames : await getFans();
        
        await saveBot(user);
        res = "Bot created";
    }
    else {
        throw ("Incorrect password");
    }
    return res;
}


const getFans = async() => {
    //ToDo llamar a la tabla fans y agarrar algunos
    return ["cristiano","redbaron"]
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

    //const userName = event.userName;
    //const password = event.password;
    //const code = event.code;

    //Post parameters

    let userName, password, req, response, type, cookies, errMessage;

    console.log("Login Event", event)


    req = (event.httpMethod === "POST") ? JSON.parse(event.body) : event

    if (req.password && req.userName) {

        userName = req.userName;
        password = req.password;
        type = req.type


        console.log("Data", userName, password, type);


        try {
            const status = await startBot(userName, password, type);

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
            console.log("Error en login", e)
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
