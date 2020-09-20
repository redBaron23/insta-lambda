const axios = require('axios');
const AWS = require("aws-sdk");
const lambda = new AWS.Lambda({ region: "us-east-1" });

const followers = (userName,cookies) => {
    const hash = "c76146de99bb02f6415203be841dd25a";
    const userId = getUserId( userName,cookies);
    
    
}


  async getUsers(QUERY_HASH, userName, quantity) {
    let nextCursor = "";
    //Last time searched for that user
    //If we are looking for ower users, it will not save the history

    let users = [];

    const userId = userName ? await this.getUserId(userName) : this._userId;
    let isNextPage = true;

    const isFollower =
      QUERY_HASH == "c76146de99bb02f6415203be841dd25a" ? true : false; //true = follower
    while (isNextPage && users.length <= quantity) {
      let query_variables ={
            id:userId,
            include_reel:true,
            fetch_mutual:false,
            first:50,
            after:nextCursor
        }
      let variables = encodeURIComponent(query_variables);
      let URL =
        "https://www.instagram.com/graphql/query/?query_hash=" +
        QUERY_HASH +
        "&variables=" +
        variables;
      helper.sleep(1200);
      let response = await this.parseData(URL, isFollower);

      users = [...users, ...response.users];

      nextCursor = response.nextCursor;
      isNextPage = nextCursor ? true : false;
    }
    nextCursor = nextCursor ? nextCursor : "";
    const userType = isFollower ? "followers" : "following";
    userHistory[userName] = { nextCursor: nextCursor, userType: users };
    helper.writeJson(userHistory, uri_history);
    return users.slice(0, quantity);
  }


  async parseData(URL, isFollower) {
    let nextCursor = false;

    const response = await this.getData(URL);

    const data = isFollower
      ? response.data.data.user.edge_followed_by
      : response.data.data.user.edge_follow;
    const isNextPage = data.page_info.has_next_page;
    if (isNextPage) {
      nextCursor = data.page_info.end_cursor;
    }

    const array = data.edges;
    const users = array.map(i => i.node.username);
    return {
      users,
      nextCursor
    };
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
        else resolve(results.Payload);
    });
  });
};
exports.handler = async (event) => {
    // TODO implement
    
    
    
    console.log("myEvent",event);

    let req,userName,cookies,response,errMessage,userId;
    
    //Evento desde c9
    //const userName = event.userName;

    
    
    if (event.httpMethod === "POST"){
        //Viene por POST y manda cookies
        req = JSON.parse(event.body);

        userName = req.userName;
        cookies = req.cookies /*{//redbaron395
            sessionid:"42041085257%3AEM95AKNBzKuVbJ%3A17",
            csrftoken:"5cQ6FQfWagyq7Xg0j2xSqVt84pCTbzAd"
        }*/
    }else{
        userName = event.userName;
        cookies = event.cookies;
    }
    
    


    return ;
};
