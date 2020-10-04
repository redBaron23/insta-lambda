const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });

const stopBot = async(userName, password) => {
    let res = "Hubo un error"
    const user = await getUser(userName);

    if (user.password === password) {

        await deleteBot(userName);
        res = "Se elimino el bot"
    }
    else {
        throw ("Hubo un error")
    }
    return res;
}

const deleteBot = async(userName) => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const params = {
        TableName: "Bot",
        Key: {
            userName: userName
        }
    }

    const data = await documentClient.delete(params).promise();
    console.log("User", data);
    return data;
}

const getUser = async(userName) => {


    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const params = {
        TableName: "Users",
        Key: {
            userName: userName
        }
    }

    const data = await documentClient.get(params).promise();
    if (!data.Item) throw "User not found";
    console.log("User", data.Item);
    return data.Item;
}


exports.handler = async(event) => {
    // TODO implement
    // llamar a la tabla fans y agarrar algunos



    let userName, password, req, response, cookies, errMessage;

    console.log("Login Event", event)


    req = (event.httpMethod === "POST") ? JSON.parse(event.body) : event

    if (req.password && req.userName) {

        userName = req.userName;
        password = req.password;


        console.log("Data", userName, password);


        try {
            const status = await stopBot(userName, password);

            console.log("RES", status);


            response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(cookies),
            };
        }
        catch (e) {
            console.log("Error en startBot", e)
            response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(e.code),
            };
        }

    }
    else {
        errMessage = "Need userName and password"
        response = {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(errMessage),
        };
    }









    return response;
};
