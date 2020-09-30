const AWS = require("aws-sdk");
const lambda = new AWS.Lambda({ region: "us-east-1" });

const waitTime = 20 * 1000 //20 sec


const getGarcas = async (userName) => {
  let followers,followings,garcas,rawFollowers,rawFollowings;
  rawFollowers = await getFollowers(userName);
  rawFollowings = await getFollowings(userName);
  
  if (!rawFollowers || !rawFollowings){
      await delay(waitTime);
      garcas = await getGarcas(userName);
  }
  else{
      followers = JSON.parse(rawFollowers);
      followings = JSON.parse(rawFollowings);
      garcas = followings.filter(i => !followers.includes(i));
  }
  
  return garcas;
}

const delay = ms => new Promise(res => setTimeout(res, ms));



const getFollowings = async (userName) => {
    let followings;   
    const url = "cloud9-insta-bot-node-readFollowings-DS9Q4JRGGJ1Z";
    return await exeLambda(userName,url);

};

const getFollowers = async (userName) => {
  const url = "cloud9-insta-bot-node-readFollowers-92ZGQ4BFDZ52";
  return await exeLambda(userName,url);
};


const exeLambda = async (userName,url) => {
    return await new Promise((resolve, reject) => {
    const params = {
        FunctionName: url,
        Payload: JSON.stringify({
            userName,
        }),
    };

    lambda.invoke(params, (err, results) => {
        if (err) reject(err);
        else {
            const json = JSON.parse(results.Payload);
            json.statusCode !== 200 && reject(json.body)
            console.log("Response",json.body)
            resolve(json.body)
        };
    });
  });
}


exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("followers event",event);

    let userName,garcas,errMessage;
    

    let response = {}
        response.headers = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    

    const req = (event.httpMethod === "GET") ? event.queryStringParameters : event

    userName = req.userName;

    
    
    try{

        if (userName){
            garcas = await getGarcas(userName);
            response.statusCode = 200
            response.body = JSON.stringify(garcas)        
        }
        else{
            errMessage = "userName and cookies are required";
    
            response.statusCode = 400
            response.body = JSON.stringify(errMessage)
        }
    }
    catch(e){
        console.log("Algo se rompio",e)
        errMessage = "User not found";
        response.statusCode = 400;
        response.body = JSON.stringify(errMessage);
    }
    return response;
};