const axios = require("axios");
const AWS = require("aws-sdk");


const lambda = new AWS.Lambda({ region: "us-east-1" });

const bestRatio = 1.1;

const follow = async(userName, cookies, ratio) => {

    let json, userId, followers, followings, currentRatio, response;

    json = JSON.parse(await getUserInfo(userName, cookies));

    userId = json.id;
    followers = json.followers;
    followings = json.followings;

    //Sigue / siguen
    currentRatio = followings / followers;

    await saveFan(userName,currentRatio);
    if ((currentRatio >= ratio) || (!ratio)) {
        const url = "https://www.instagram.com/web/friendships/" + userId + "/follow/";


        console.log("URL", url)
        const headers = {
            Accept: "*/*",
            Cookie: "sessionid=" + cookies.sessionid,
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:80.0) Gecko/20100101 Firefox/80.0",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "X-CSRFToken": cookies.csrftoken,
            "X-IG-App-ID": "936619743392459",
            "X-IG-WWW-Claim": "hmac.AR219pFWs-qIxhqhubZT5W5dTLRV0tSHDzJDtK0-cg2BwLdF",
            "X-Requested-With": "XMLHttpRequest",
            Connection: "close",
            Referer: "https://www.instagram.com/"
        };

        const options = {
            url: url,
            method: "POST",
            headers: headers
        };



        const res = await axios(options);

        console.log("Status de request", res.status);
        response = "ok"
    }
    else {
        response = "No es viable seguir"
    }
    return response;

}


const saveFan = async(userName, ratio) => {

    let random;
    let user = {
        userName:userName,
        ratio:ratio
    }
    if (ratio > bestRatio) {
        random = await getFan("random");
        random.followers.push(user);
        await writeFan(random);
    }
}

const writeFan = async(item) => {



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

const getFan = async(userName) => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const params = {
        TableName: "Fans",
        Key: {
            userName: userName
        }
    }

    const data = await documentClient.get(params).promise();
    if (!data.Item) throw "User not found";
    console.log(data.Item);
    return data.Item;
}

const getUserInfo = async(userName, cookies) => {
    return await new Promise((resolve, reject) => {
        const params = {
            FunctionName: "cloud9-insta-bot-node-getUserInfo-XY7YT9BPKB3D",
            Payload: JSON.stringify({
                userName,
                cookies,
            }),
        };

        lambda.invoke(params, (err, results) => {
            if (err) reject(err);
            else {
                const json = JSON.parse(results.Payload);
                console.log("USERID DEL JSON", json.body)
                resolve(json.body)
            };
        });
    });
};


exports.handler = async(event) => {
    // TODO implement



    console.log("followers event", event);

    let userName, cookies, errMessage, status, ratio;



    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }


    const req = (event.httpMethod === "POST") ? JSON.parse(event.body) : event

    userName = req.userName;
    cookies = req.cookies;
    ratio = req.ratio;

    try {

        if (userName && cookies) {
            errMessage = await follow(userName, cookies, ratio);
            response.statusCode = 200;
            response.body = JSON.stringify(errMessage)
        }
        else {
            errMessage = "userName and cookies are required";

            response.statusCode = 400
            response.body = JSON.stringify(errMessage)
        }
    }
    catch (e) {
        console.log("Algo se rompio", e)
        errMessage = "Something went wrong";
        response.statusCode = 500;
        response.body = JSON.stringify(errMessage);
    }
    return response;
};
