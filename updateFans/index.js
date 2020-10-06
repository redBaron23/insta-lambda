const AWS = require("aws-sdk");


AWS.config.update({ region: "us-east-1" });

const lambda = new AWS.Lambda({ region: "us-east-1" });



    const getBots = async () => {
        
        console.log("Dynamo");
        const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});
        
        var params = {
            TableName : "Bot"
        };
    
        const bots =  await documentClient.scan(params).promise();
        return bots.Items
    }

const start = async(bots) =>{
    
}

exports.handler = async (event) => {
    // TODO implement
    //Reprogramar proxima ejecucion en #0
    
    
    console.log("Update bot",event);

    let bots,errMessage;
    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    try{
        
        bots = await getBots();
        await start(bots);
        
        //#0
        
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
