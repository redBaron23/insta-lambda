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
    
    try {
        const data = await documentClient.get(params).promise();
        console.log(data.Item.followings);
        return data.Item.followings;
    } catch (err) {
        console.log(err);
    }
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
    

    const req = (event.httpMethod === "POST") ? JSON.parse(event.body) : event

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
        errMessage = "Something went wrong";
        response.statusCode = 500;
        response.body = JSON.stringify(errMessage);
    }
    return response;
};