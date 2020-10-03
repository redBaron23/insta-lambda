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