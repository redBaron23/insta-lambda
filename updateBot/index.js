const axios = require('axios');
const AWS = require("aws-sdk");


AWS.config.update({ region: "us-east-1" });

const lambda = new AWS.Lambda({ region: "us-east-1" });
const helper = require("../fun/helper")



    const getBots = async () => {
        
        console.log("Dynamo");
        const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});
        
        var params = {
            TableName : "Bot"
        };
    
        const bots =  await documentClient.scan(params).promise();
        return bots.Items
    }
    
    const follow = async(userName,cookies) => {
        console.log("Follow",userName);
    }
    
    const unFollow = async(userName,cookies) => {
        console.log("Follow",userName);
    }
    
    const saveBot = async(bot) =>{
        console.log("Bot guardado",bot);
    }

    const start = async(bots) => {
        await Promise.all(bots.map(async (bot) => {
            
            if (bot.status === "enabled"){
                let userName,cookies;
                console.log(bot);
                cookies = bot.cookies;
                if (bot.action === "follow"){
                    userName = bot.follow.pop();
                    await follow(userName,cookies);
                    
                    //Static = sigue siempre a los mismos. Dynamic, los sigue, los deja de seguir y ahi queda
                    if ((bot.type === "staticFarm") || (bot.type === "dynamicFarm")) bot.unfollow.push(userName)
                    
                }
                else{
                    userName = bot.unfollow.pop();
                    await unFollow(userName,cookies);
                    
                    if (bot.type === "staticFarm") bot.follow.push(userName)
    
                    console.log("unFollow",bot.unfollow)
    
                }            
            
                await saveBot(bot);
            }
    
            
        }));
    }




    const saveData = async (item) => {
  
        
      
        const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});
        
        const params = {
            TableName: "Bot",
            Item:item
        }
        
        try {
            const data = await documentClient.put(params).promise();
            console.log(data);
        } catch (err) {
            console.log(err);
        }      
        
    }



exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("Update bot",event);

    let userId,req,bots,cookies,errMessage,newRecords,updateRecords;
    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    try{
        
        bots = await getBots();
        await start(bots);

        errMessage = "Todo ok"
        response.statusCode = 200
        response.body = JSON.stringify(errMessage)        
    }
    catch(e){
        console.log("Hubo un error",e)
        errMessage = "Hubo un error"
        response.statusCode = 500
        response.body = JSON.stringify(errMessage)  
    }

    
    

    console.log("My respuesta",response);
    return response;
};
