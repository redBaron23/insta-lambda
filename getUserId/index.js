const axios = require('axios');




const getUserId = async (userName,cookies) => {
    let response;
    const URL = "https://www.instagram.com/" + userName + "/?__a=1";
    
    if (!cookies) {
            
            response = await axios.get(URL);

        
    }
    else{
        //Tenemos cookies
        
        //Se podrian agregar mas cookies quizas
        const HEADERS = {
          Accept: "*/*",
          Cookie: "sessionid=" + cookies.sessionid,
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0",
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
        
<<<<<<< HEAD
        
=======
    
>>>>>>> 6ac20f2240089c9c52b1588294f4ec83c4d90e5c
        response = await axios(options);
    }



    if (response.data.graphql){
        console.log("RES DATA",response.data)
        return response.data.graphql.user.id;
    }
    else{
        //No existe el userName o muchas request checkear 429
<<<<<<< HEAD
    
        console.log("Res",response);
=======
>>>>>>> 6ac20f2240089c9c52b1588294f4ec83c4d90e5c
    }

}


exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("myEvent",event);

    let userId,req,userName,cookies,response,errMessage;
    
    //Evento desde c9
    //const userName = event.userName;

    
    
    if (event.httpMethod === "GET"){
        req = event.queryStringParameters;
        userName = req.userName;
<<<<<<< HEAD
    }else if (event.httpMethod === "POST"){
=======
    }else{
>>>>>>> 6ac20f2240089c9c52b1588294f4ec83c4d90e5c
        //Viene por POST y manda cookies
        req = JSON.parse(event.body);

        userName = req.userName;
        cookies = req.cookies /*{//redbaron395
            sessionid:"42041085257%3AEM95AKNBzKuVbJ%3A17",
            csrftoken:"5cQ6FQfWagyq7Xg0j2xSqVt84pCTbzAd"
        }*/
<<<<<<< HEAD
    }else{
        userName = event.userName;
        cookies = event.cookies;
=======
>>>>>>> 6ac20f2240089c9c52b1588294f4ec83c4d90e5c
    }
    
    



    console.log("Parametros",req);

    console.log("Cookies",cookies);

    
<<<<<<< HEAD
=======
    
    try{
        if( userName ){
            
            
    
            userId = await getUserId(userName,cookies)
    
            console.log("El userId",userId);
            console.log("El userName",userName);
            
            
            response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Headers" : "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(userId),
            };        
        }else{
            errMessage = "userName is required";
            response = {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Headers" : "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(errMessage),
            };            
        }        
    }
    catch(e){
        if (e.response.status == 429){
            errMessage = e.response.data;
            response = {
                statusCode: 429,
                headers: {
                    "Access-Control-Allow-Headers" : "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(errMessage),
            }; 
        }
        
    }
    

>>>>>>> 6ac20f2240089c9c52b1588294f4ec83c4d90e5c
    
    try{
        if( userName ){
            
            
    
            userId = await getUserId(userName,cookies)
    
            console.log("El userId",userId);
            console.log("El userName",userName);
            
            
            response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Headers" : "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(userId),
            };        
        }else{
            errMessage = "userName is required";
            response = {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Headers" : "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(errMessage),
            };            
        }        
    }
    catch(e){
        if (e.response.status == 429){
            errMessage = e.response.data;
            response = {
                statusCode: 429,
                headers: {
                    "Access-Control-Allow-Headers" : "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(errMessage),
            }; 
        }
        
    }
    

    console.log("My respuesta",response);
    return response;
};
