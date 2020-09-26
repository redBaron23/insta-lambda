const AWS = require("aws-sdk");


AWS.config.update({ region: "us-east-1" });


const readFollowings = async (userName) => {
    
    
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});
    
    const params = {
        TableName: "Users",
        Key: {
          userName: userName
        }
    }
    
        const data = await documentClient.get(params).promise();
        if (!data.Item) throw "User not found";
        console.log(data.Item.followings);
        return data.Item.followings;

}
exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("followings event",event);

    let userName,followings,errMessage;
    
    
    
    let response = {}
        response.headers = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    

<<<<<<< HEAD
    const req = (event.httpMethod === "POST") ? JSON.parse(event.body) : event
=======
    const req = (event.httpMethod === "GET") ? JSON.parse(event.body) : event
>>>>>>> b6e1e666041240281bebb96053ad805f8303c473

    userName = req.userName;

    
    
    try{

        if (userName){
            followings = await readFollowings(userName);
            response.statusCode = 200
            response.body = JSON.stringify(followings)        
        }
        else{
            errMessage = "userName and cookies are required";
    
            response.statusCode = 400
            response.body = JSON.stringify(errMessage)
        }
    }
    catch(e){
        console.log("Algo se rompio",e)
<<<<<<< HEAD
        errMessage = "Something went wrong";
        response.statusCode = 500;
=======
        errMessage = "User not found";
        response.statusCode = 400;
>>>>>>> b6e1e666041240281bebb96053ad805f8303c473
        response.body = JSON.stringify(errMessage);
    }
    return response;
};