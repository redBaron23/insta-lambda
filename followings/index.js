const axios = require("axios");
const AWS = require("aws-sdk");
const lambda = new AWS.Lambda({ region: "us-east-1" });
const helper = require("../fun/helper")

const followings = async (userName,cookies,i) => {
    //ToDo 
    //DynamoDB agregar 200/300 y despues que se genere una lambda
    //Para el resto que los vaya guardando.
    const quantity = (i) ? i : 500;
    const queryHash = "d04b0a864b4b54837c0d870b0e77e076";
    
    let userNames,lastPage;
    let  isNextPage= true;
    let followings = [];
    

    

    while (isNextPage && (followings.length <= quantity)) {

      helper.sleep(1000);
      
      [userNames,lastPage] = await getUserNames(userName,cookies,queryHash,lastPage);
    

      followings = [...followings, ...userNames];
      
      isNextPage = (lastPage) ? true : false;
    }


    console.log("LENGTH",followings.length)
    console.log("FOLLOWERS",followings)
    return {
        followings: followings,
        nextCursor: lastPage
    }
    
    
}




const getUserNames = async (userName, cookies,queryHash,lastPage) => {

  return await new Promise((resolve, reject) => {
    const params = {
        FunctionName: "cloud9-insta-bot-node-userNames-2FV21E5T292H",
        Payload: JSON.stringify({
            userName,
            cookies,
            queryHash,
            lastPage
        }),
    };

    lambda.invoke(params, (err, results) => {
        if (err) reject(err);
        else {
            const json = JSON.parse(results.Payload)//JSON.parse(results.Payload);
            console.log("json",json);
            const body = JSON.parse(json.body);
            resolve([body.users,body.nextCursor])
        };
    });
  });
};



exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("myEvent",event);

    let req,userName,cookies,errMessage,quantity,json;
    
    
    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    //Evento desde c9
    //const userName = event.userName;

    
    
    if (event.httpMethod === "POST"){
        //Viene por POST y manda cookies
        req = JSON.parse(event.body);
        
        quantity = req.quantity;
        userName = req.userName;
        cookies = req.cookies
    }else{
        userName = event.userName;
        cookies = event.cookies;
        quantity = event.quantity;

    }
    
    try{
        if (userName && cookies){
            json = await followings(userName,cookies,quantity);
            response.statusCode = 200
            response.body = JSON.stringify(json)        
        }
        else{
            errMessage = "userName and cookies are required";
    
            response.statusCode = 400
            response.body = JSON.stringify(errMessage)
        }
    }
    catch(e){
        console.log("Algo se rompio",e)
        errMessage = "Something went wrong";
        response.statusCode = 500;
        response.body = JSON.stringify(errMessage);        
    }
    return response;
};
