const axios = require("axios");
const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });

const lambda = new AWS.Lambda({ region: "us-east-1" });

const helper = require("../fun/helper")

const followers = async (userName,cookies,i) => {
    //ToDo 
    //DynamoDB agregar 200/300 y despues que se genere una lambda
    //Para el resto que los vaya guardando.
    const quantity = (i) ? i : 50;
    const queryHash = "c76146de99bb02f6415203be841dd25a";
    
    let userNames,lastPage;
    let  isNextPage= true;
    let followers = [];
    

    

    while (isNextPage && (followers.length <= quantity)) {

      helper.sleep(1000);
      
      [userNames,lastPage] = await getUserNames(userName,cookies,queryHash,lastPage);
    

      followers = [...followers, ...userNames];
      
      isNextPage = (lastPage) ? true : false;
    }


    console.log("LENGTH",followers.length)
    console.log("FOLLOWERS",followers)
    
    return {
        followers: followers,
        nextCursor: lastPage
    }
    
}

/*
const dynamoGetItem = async (userName) => {
    
    
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});
    
    const params = {
        TableName: "Users",
        Key: {
          userName: userName
        }
    }
    
    try {
        const data = await documentClient.get(params).promise();
        console.log(data);
    } catch (err) {
        console.log(err);
    }
}


const dynameSetItem = async (userName) => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});
    
    const params = {
        TableName: "Users",
        Item: {
            userName: "redbaron398",
            password: "fafa"
        }
    }
    
    try {
        const data = await documentClient.put(params).promise();
        console.log(data);
    } catch (err) {
        console.log(err);
    }
}*/

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
    
    
    
    console.log("followers event",event);

    let req,userName,cookies,errMessage,quantity,json;
    
    
    let response = {}
        response.headers = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    

    
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
            json = await followers(userName,cookies,quantity);
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
