"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveData = void 0;
let AWS = require("aws-sdk");
//Configure AWS
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
//Create new DocumentClient
let documentClient = new AWS.DynamoDB.DocumentClient();
/* Function returns a Promise that will save the text with the specified timestamp and currency name. */
async function saveData(timestamp, newsText, currency) {
    //Table name and data for table
    let putParams = {
        TableName: "NewsData",
        Item: {
            Currency: currency,
            NewsTimeStamp: timestamp,
            TextData: newsText, //Text of news
        }
    };
    //Store data in DynamoDB and handle errors
    try {
        let result = await documentClient.put(putParams).promise();
        console.log("Data uploaded successfully: " + JSON.stringify(result));
    }
    catch (err) {
        console.error("ERROR uploading data: " + JSON.stringify(err));
    }
}
exports.saveData = saveData;
