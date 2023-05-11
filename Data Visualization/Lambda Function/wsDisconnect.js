let AWS = require("aws-sdk");

//Create new DocumentClient
let documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    //Get connection ID from event
    let connId = event.requestContext.connectionId;
    console.log("Disconnecting client with ID: " + connId);

    //Parameters for deleting connection ID from DynamoDB
    let params = {
        TableName: "WebSocketClients",
        Key: {
            ConnectionId: connId
        }
    };

    //Store connection Id for later communication with client
    try {
        await documentClient.delete(params).promise();
        console.log("Connection ID deleted.");

        //Return response
        return {
            statusCode: 200,
            body: "Client disconnected. ID: " + connId
        };
    }
    catch (err) {
        console.log("Error disconnecting client with ID: " + connId + ": " + JSON.stringify(err));
        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(err)
        };
    }
};
