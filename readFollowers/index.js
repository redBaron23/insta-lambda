const AWS = require("aws-sdk");


AWS.config.update({ region: "us-east-1" });


const readFollowers = async (userName) => {
    
    
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});
    
    const params = {
        TableName: "Users",
        Key: {
          userName: userName
        }
    }
    
    try {
        const data = await documentClient.get(params).promise();
        console.log(data.Item.followers);
        return data.Item.followers;
    } catch (err) {
        console.log(err);
    }
}
exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("followers event",event);

    let userName,followers,errMessage;
    
    
    
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
            followers = await readFollowers(userName);
            response.statusCode = 200
            response.body = JSON.stringify(followers)        
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