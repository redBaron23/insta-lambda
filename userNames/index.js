const axios = require('axios');
const AWS = require("aws-sdk");
const lambda = new AWS.Lambda({ region: "us-east-1" });

  const getUsers = async (userName,cookies,queryHash,lastPage) => {
    const followerHash = "c76146de99bb02f6415203be841dd25a";
    const userId = await getUserId( userName,cookies);
    
    console.log(userId)
    let nextCursor,response;
    let users = [];

    const query_variables = {
        id:userId,
        include_reel:true,
        fetch_mutual:false,
        first:50,
        after:lastPage
    };
    console.log("Sin parse",JSON.stringify(query_variables))
    const variables = encodeURIComponent(JSON.stringify(query_variables));
    console.log("VARI",variables)
    const url =
        "https://www.instagram.com/graphql/query/?query_hash=" +
        queryHash +
        "&variables=" +
        variables;
        
    console.log("URL",url)
    const HEADERS = {
        Accept: "*/*",
        Cookie: "sessionid=" + cookies.sessionid,
        "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "X-CSRFToken": cookies.csrftoken,
        "X-IG-App-ID": "936619743392459",
        "X-IG-WWW-Claim": "hmac.AR219pFWs-qIxhqhubZT5W5dTLRV0tSHDzJDtK0-cg2BwLdF",
        "X-Requested-With": "XMLHttpRequest",
        Connection: "close",
        Referer: "https://www.instagram.com/",
        Host: "www.instagram.com"
    };
    
    const options = {
        url: url,
        method: "GET",
        headers: HEADERS
    };
    
    console.log("Antes del req",options)
    
   
    
    const res = await axios(options);
    
    
    console.log("Respuesta de FOLLOWERS/FOLLOWING",res.data)
    
    //Si se consulto seguidores o seguidos
    const data = ( res.data.data.user.edge_followed_by ) ? res.data.data.user.edge_followed_by : res.data.data.user.edge_follow
    const array = data.edges;
    users = array.map(i => i.node.username);
    
    nextCursor = (data.page_info.has_next_page) ? data.page_info.end_cursor : false;
    response = {
        users,nextCursor
    }
    return response

  }







const getUserId = async (userName, cookies) => {
  return await new Promise((resolve, reject) => {
    const params = {
        FunctionName: "cloud9-insta-bot-node-getUserId-1UOOK5KBHWZYW",
        Payload: JSON.stringify({
            userName,
            cookies,
        }),
    };

    lambda.invoke(params, (err, results) => {
        if (err) reject(err);
        else {
            const json = JSON.parse(results.Payload);
            console.log("USERID DEL JSON",json.body)
            resolve(json.body)
        };
    });
  });
};




exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("Evento de userNames",event);

    let userName,cookies,queryHash,lastPage,errMessage,users;
    let response = {}
    response.headers = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    //Evento desde c9
    //const userName = event.userName;

    try{
        if (event.userName && event.cookies && event.queryHash){
            
            userName = event.userName;
            cookies = event.cookies;
            queryHash = event.queryHash;
            lastPage = event.lastPage;
            
    
            users = await getUsers(userName,cookies,queryHash,lastPage);
            
            response.statusCode = 200
            response.body = JSON.stringify(users)  
        }
        else{
            errMessage = "Bad Request";
            response.statusCode = 400
            response.body = JSON.stringify(errMessage)      
        }        
    }
    catch(e){
        console.log("Crasheo por, probablemente muchas request",e)
        errMessage = "Hubo un error";
        response.statusCode = 500
        response.body = JSON.stringify(errMessage)            
    }   

    



    return response;
};
