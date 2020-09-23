const axios = require('axios');
const AWS = require("aws-sdk");


AWS.config.update({ region: "us-east-1" });

const lambda = new AWS.Lambda({ region: "us-east-1" });



const updateData = async(records) => {
    
    
    await Promise.all(records.map(async (record) => {
        let marshall,userName,password,cookies,item;
        marshall = record.dynamodb.NewImage;
        console.log("Record de updateData",record.dynamodb.NewImage);
        
        
        item = AWS.DynamoDB.Converter.unmarshall(marshall)
        
        console.log("Json ",item)

        
        await saveFollowers(item);
        await saveFollowings(item);
    }));
}

    const saveFollowings = async (item) => {
  
        
        let followings,nextCursor;
        
        [followings,nextCursor] = await getFollowings(item.userName,item.cookies);
        
        item.followings = followings;
        item.followingsNextCursor = nextCursor;
        
        const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});
        
        const params = {
            TableName: "Users",
            Item:item
        }
        
        try {
            const data = await documentClient.put(params).promise();
            console.log(data);
        } catch (err) {
            console.log(err);
        }      
        
    }




    const saveFollowers = async (item) => {
        
        let followers,nextCursor;
        
        [followers,nextCursor] = await getFollowers(item.userName,item.cookies);
        
        
        item.followers = followers;
        item.followersNextCursor = nextCursor;
        const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});
        
        const params = {
            TableName: "Users",
            Item:item
        }
        
        try {
            const data = await documentClient.put(params).promise();
            console.log(data);
        } catch (err) {
            console.log(err);
        }      
        
        
    }

    const getFollowers = async (userName, cookies) => {
    
      return await new Promise((resolve, reject) => {
        const params = {
            FunctionName: "cloud9-insta-bot-node-followers-1K7LJLPSTZFC2",
            Payload: JSON.stringify({
                userName,
                cookies
            }),
        };
    
        lambda.invoke(params, (err, results) => {
            if (err) reject(err);
            else {
                const json = JSON.parse(results.Payload)//JSON.parse(results.Payload);
                console.log("json",json);
                const body = JSON.parse(json.body);
                resolve([body.followers,body.nextCursor])
            };
        });
      });
    };

    const getFollowings = async (userName, cookies) => {
    
      return await new Promise((resolve, reject) => {
        const params = {
            FunctionName: "cloud9-insta-bot-node-followings-YNPDP2HWRNQG",
            Payload: JSON.stringify({
                userName,
                cookies
            }),
        };
    
        lambda.invoke(params, (err, results) => {
            if (err) reject(err);
            else {
                const json = JSON.parse(results.Payload)//JSON.parse(results.Payload);
                console.log("json",json);
                const body = JSON.parse(json.body);
                resolve([body.followings,body.nextCursor])
            };
        });
      });
    };


exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("myEvent",event);

    let userId,req,userName,cookies,errMessage,records;
    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    console.log("Records [0]",event.Records[0].dynamodb)
    records = event.Records.filter( i => i.eventName === "INSERT");
    try{
        console.log("Length",records.length)
        if (records.length > 0) await updateData(records)
        
        console.log("var records",records);
        
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

    
    //const userName = event.userName;

    /*
    
    if (event.httpMethod === "GET"){
        req = event.queryStringParameters;
        userName = req.userName;

    }else if (event.httpMethod === "POST"){

        //Viene por POST y manda cookies
        req = JSON.parse(event.body);

        userName = req.userName;
        cookies = req.cookies

    }else{
        userName = event.userName;
        cookies = event.cookies;

    }
    
    



    console.log("Parametros",req);

    console.log("Cookies",cookies);

    

    
    try{
        if( userName ){
            
            
    
            userId = 5//await getUserId(userName,cookies)
    
            console.log("El userId",userId);
            console.log("El userName",userName);
            
            response.statusCode = 200
            response.body = JSON.stringify(parseInt(userId,10))
      
        }else{
            errMessage = "userName is required";

            response.statusCode = 400
            response.body = JSON.stringify(errMessage)
        
        }        
    }
    catch(e){
        if (e.response.status == 429){
            errMessage = e.response.data;

            response.statusCode = 429
            response.body = JSON.stringify(errMessage)

        }
        
    }*/
    

    console.log("My respuesta",response);
    return response;
};
