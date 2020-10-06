const axios = require('axios');
const AWS = require("aws-sdk");



const getUserData = async(userName, cookies) => {
    let response, id, followers, followings,res;
    const URL = "https://www.instagram.com/" + userName + "/?__a=1";

    if (!cookies) {

        response = await axios.get(URL);


    }
    else {
        //Tenemos cookies

        //Se podrian agregar mas cookies quizas
        const HEADERS = {
            Accept: "*/*",
            Cookie: "sessionid=" + cookies.sessionid,
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "X-CSRFToken": cookies.csrftoken,
            "X-IG-App-ID": "936619743392459",
            "X-IG-WWW-Claim": "hmac.AR219pFWs-qIxhqhubZT5W5dTLRV0tSHDzJDtK0-cg2BwLdF",
            "X-Requested-With": "XMLHttpRequest",
            Connection: "close",
            Referer: "https://www.instagram.com/",
            Host: "www.instagram.com"
        };
        const options = {
            url: URL,
            method: "GET",
            headers: HEADERS
        };


        response = await axios(options);
    }



    if (response.data.graphql) {
        console.log("RES DATA", response.data);

        id = parseInt(response.data.graphql.user.id,10);
        followers = response.data.graphql.user.edge_followed_by.count;
        followings = response.data.graphql.user.edge_follow.count;
        console.log("followers", followers);
        console.log("followers", followings);
        
        return {
            id:id,
            followers:followers,
            followings:followings
        }
    }
    else {
        //No existe el userName o muchas request checkear 429


        console.log("Res", response);

    }

}


exports.handler = async(event) => {
    // TODO implement



    console.log("myEvent", event);

    let userData, req, userName, cookies, errMessage;
    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    //Evento desde c9
    //const userName = event.userName;



    if (event.httpMethod === "GET") {
        req = event.queryStringParameters;
        userName = req.userName;

    }
    else if (event.httpMethod === "POST") {

        //Viene por POST y manda cookies
        req = JSON.parse(event.body);

        userName = req.userName;
        cookies = req.cookies
        /*{//redbaron395
                   sessionid:"42041085257%3AEM95AKNBzKuVbJ%3A17",
                   csrftoken:"5cQ6FQfWagyq7Xg0j2xSqVt84pCTbzAd"
               }*/

    }
    else {
        userName = event.userName;
        cookies = event.cookies;

    }





    console.log("Parametros", req);

    console.log("Cookies", cookies);





    try {
        if (userName) {



            userData = await getUserData(userName, cookies)

            console.log("El userName", userName);

            response.statusCode = 200
            response.body = JSON.stringify(userData)

        }
        else {
            errMessage = "userName is required";

            response.statusCode = 400
            response.body = JSON.stringify(errMessage)

        }
    }
    catch (e) {
        if (e.response.status == 429) {
            errMessage = e.response.data;

            response.statusCode = 429
            response.body = JSON.stringify(errMessage)

        }

    }



    console.log("My respuesta", response);
    return response;
};
