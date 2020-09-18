const axios = require('axios');



const getUserId = async (userName) => {
    let response;
    if (userName) {
            const URL = "https://www.instagram.com/" + userName + "/?__a=1";
            const res = await this.getData(URL);
            if (res.data){
                response = res.data.graphql.user.id;
            }
            else{
                //No existe el userName
            }
        }
    return response;
}


exports.handler = async (event) => {
    // TODO implement
    
    
    //const userName = event.userName;

    //Get parameters
    const req = event.queryStringParameters;



    console.log(req);
    const userName = req.userName;
    
    console.log("Event",event);
    
    const userId = await getUserId(userName)

    console.log("El userId",userId);
    console.log("El userName",userName);



    console.log("RES",userId);
    
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(userId),
    };
    
    return response;
};
