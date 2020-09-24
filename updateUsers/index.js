const axios = require('axios');
const AWS = require("aws-sdk");


AWS.config.update({ region: "us-east-1" });

const lambda = new AWS.Lambda({ region: "us-east-1" });
const helper = require("../fun/helper")



const onCreate = async(records) => {
    
    
    await Promise.all(records.map(async (record) => {
        let marshall,cookies,item,nextCursor;
        nextCursor = "";
        marshall = record.dynamodb.NewImage;
        console.log("Record de onCreate",record.dynamodb.NewImage);
        
        
        item = AWS.DynamoDB.Converter.unmarshall(marshall)
        
        console.log("Json ",item)


        const [followings,followingsNextCursor] = await getFollowings(item.userName,item.cookies,nextCursor);
        const [followers,followersNextCursor] = await getFollowers(item.userName,item.cookies,nextCursor);
        
        console.log("RES ACA PAPA",followers)
        item.followings = followings;
        item.followingsNextCursor = followingsNextCursor;
        item.followers = followers;
        item.followersNextCursor = followersNextCursor; 
        
        
        console.log("___PUNTEROS__",followersNextCursor,followingsNextCursor);
        await saveData(item);
        console.log("SE GUARDO CON EXITO_______")
    }));
}


const onUpdate = async(records) => {
    
    await helper.sleep(4000)//4 seg
    await Promise.all(records.map(async (record) => {
        let marshall,cookies,item,userName,newFollowings,newFollowers;
        let update = false;

        
        marshall = record.dynamodb.NewImage;
        console.log("Record de onUpdate",record.dynamodb.NewImage);
        
        item = AWS.DynamoDB.Converter.unmarshall(marshall)
        
        userName = item.userName;
        cookies = item.cookies;
        console.log("Item received ",item)
        
        
        
        
        
        
        if (item.followersNextCursor){
            const [followers,followersNextCursor] = await getFollowers(userName,cookies,item.followersNextCursor)
            newFollowers = [ ...item.followers, ...followers]
            item.followers = newFollowers;
            item.followersNextCursor = followersNextCursor;
            update = true
            
        }
        else if (item.followingsNextCursor){
            const [followings,followingsNextCursor] = (item.followingsNextCursor) ? await getFollowings(userName,cookies,item.followingsNextCursor) : [false,false]
            newFollowings = [ ...item.followings, ...followings]
            item.followings = newFollowings;
            item.followingsNextCursor = followingsNextCursor;
            update = true
        }
        

        
        if (update) await saveData(item);

        /*
        
        
        const [followings,followingsNextCursor] = (item.followingsNextCursor) ?  await getFollowings(item.userName,item.cookies,item.followingsNextCursor) : [false,false];
        const [followers,followersNextCursor] = (item.followersNextCursor) ? await getFollowers(item.userName,item.cookies,item.followersNextCursor) : [false,false];
        
        if(followings) item.followings = [ ...item.followings, ...followings]
        if(followers) item.followers = [ ...item.followers, ...followers]

        if (followings || followers){
            item.followingsNextCursor = followingsNextCursor;
            item.followersNextCursor = followersNextCursor; 
        
        
            console.log("___PUNTEROS__",followersNextCursor,followingsNextCursor);
            console.log("Followers",item.followers.length)
            console.log("followings",item.followings.length)
            
            await saveData(item);
            console.log("Updated!_______")
        }
*/
        
    }));
}


    const saveData = async (item) => {
  
        
      
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




    const getFollowers = async (userName, cookies,nextPage) => {
    
    const nextCursor = (nextPage) ? nextPage : "";
      return await new Promise((resolve, reject) => {
        const params = {
            FunctionName: "cloud9-insta-bot-node-followers-1K7LJLPSTZFC2",
            Payload: JSON.stringify({
                userName,
                cookies,
                nextCursor
            }),
        };
    
        lambda.invoke(params, (err, results) => {
            if (err) reject(err);
            else {
                console.log("getFollowers RES",results)
                
                const json = JSON.parse(results.Payload)//JSON.parse(results.Payload);
                console.log("getFollowers",json);
                const body = JSON.parse(json.body);
                resolve([body.followers,body.nextCursor])
            };
        });
      });
    };

    const getFollowings = async (userName, cookies,nextCursor) => {
    

      return await new Promise((resolve, reject) => {
        const params = {
            FunctionName: "cloud9-insta-bot-node-followings-YNPDP2HWRNQG",
            Payload: JSON.stringify({
                userName,
                cookies,
                nextCursor
            }),
        };
    
        lambda.invoke(params, (err, results) => {
            if (err) reject(err);
            else {
                console.log("getFollowings RES",results.Payload)
                const json = JSON.parse(results.Payload)//JSON.parse(results.Payload);
                const body = JSON.parse(json.body);

                resolve([body.followings,body.nextCursor])
            };
        });
      });
    };


exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("myEvent",event);

    let userId,req,userName,cookies,errMessage,newRecords,updateRecords;
    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    console.log("Records [0]",event.Records[0].dynamodb)
    newRecords = event.Records.filter( i => i.eventName === "INSERT");
    updateRecords = event.Records.filter( i => i.eventName === "MODIFY");
    try{
        console.log("Length",newRecords.length)
        
        if (newRecords.length > 0) await onCreate(newRecords)
        if (updateRecords.length > 0) await onUpdate(updateRecords)
        console.log("var records",newRecords);
        
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
