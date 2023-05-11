let AWS = require("aws-sdk");

//Import functions for database
let db = require('database');

module.exports.getSendDataPromises = async (cryptoData, domainName, stage) => {
    //Get connection IDs of clients
    let clientIdArray = (await db.getConnectionIds()).Items;
    console.log("\nClient IDs:\n" + JSON.stringify(clientIdArray));

    //Create API Gateway management class.
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        endpoint: domainName + '/' + stage
    
    });

    //Try to send data to connected clients
    let dataPromiseArray = clientIdArray.map( async item => {
        try{
            console.log("Sending data '" + cryptoData + "' to: " + item.ConnectionId);

            //Create parameters for API Gateway
            let apiData = {
                ConnectionId: item.ConnectionId,
                Data: cryptoData
            };

            //Wait for API Gateway to execute and log result
            await apigwManagementApi.postToConnection(apiData).promise();
            console.log("Message '" + cryptoData + "' sent to: " + item.ConnectionId);
        }
        catch(err){
            console.log("Failed to send message to: " + item.ConnectionId);

            //Delete connection ID from database
            if(err.statusCode == 410) {
                try {
                    await db.deleteConnectionId(item.ConnectionId);
                }
                catch (err) {
                    console.log("ERROR deleting connectionId: " + JSON.stringify(err));
                    throw err;
                }
            }
            else{
                console.log("UNKNOWN ERROR: " + JSON.stringify(err));
                throw err;
            }
        }
    });

    return dataPromiseArray;
};


