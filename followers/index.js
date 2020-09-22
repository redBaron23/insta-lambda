const axios = require("axios");
const AWS = require("aws-sdk");
const lambda = new AWS.Lambda({ region: "us-east-1" });
const helper = require("../fun/helper")

const followers = async (userName,cookies,i) => {
    //ToDo 
    //DynamoDB agregar 200/300 y despues que se genere una lambda
    //Para el resto que los vaya guardando.
    const quantity = (i) ? i : 10000;
    const followersHash = "c76146de99bb02f6415203be841dd25a";
    
    let userNames,lastPage;
    let  isNextPage= true;
    let followers = [];
    

    

    while (isNextPage && (followers.length <= quantity)) {

      helper.sleep(1000);
      
      [userNames,lastPage] = await getUserNames(userName,cookies,followersHash,lastPage);
    

      followers = [...followers, ...userNames];
      
      isNextPage = (lastPage) ? true : false;
    }


    console.log("LENGTH",followers.length)
    console.log("FOLLOWERS",followers)
    
    
    
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
            const body = JSON.parse(json.body);
            resolve([body.users,body.nextCursor])
        };
    });
  });
};



exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("myEvent",event);

    let req,userName,cookies,response,errMessage,quantity;
    
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
    
    
    if (userName && cookies){
        response = await followers(userName,cookies,quantity);
    }
    else{
        response = false;
    }

    return response;
};
