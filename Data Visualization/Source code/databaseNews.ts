let AWS = require("aws-sdk");

//Configure AWS
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

//Create new DocumentClient
let documentClient = new AWS.DynamoDB.DocumentClient();

/* Function returns a Promise that will save the text with the specified timestamp and currency name. */
export async function saveData(timestamp: number, newsText: string, currency: string){
    //Table name and data for table
    let putParams = {
        TableName: "NewsData",
        Item: {
            Currency: currency,
            NewsTimeStamp: timestamp,//timestamp of the news
            TextData: newsText,//Text of news
        }
    };
    //Store data in DynamoDB and handle errors
    try {
        let result = await documentClient.put(putParams).promise();
        console.log("Data uploaded successfully: " + JSON.stringify(result));
    } catch (err) {
        console.error("ERROR uploading data: " + JSON.stringify(err));
    }

}


