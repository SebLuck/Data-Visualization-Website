let AWS = require("aws-sdk");
//Create instance of Comprehend
let comprehend = new AWS.Comprehend();

let ddb = new AWS.DynamoDB();

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event));
    for(let record of event.Records){
        if(record.eventName === "INSERT"){
            // Extract currency name, text and timestamp
            let text = record.dynamodb.NewImage.TextData.S;
            if (text === ""){
                continue;
            }
            let currency = record.dynamodb.NewImage.Currency.S;
            let timeStamp = record.dynamodb.NewImage.NewsTimeStamp.N;
            console.log('Extracted values:', text, currency, timeStamp);
             // Process text for sentiment
            let params = {
                LanguageCode: 'en',
                Text: text
            }
            let result = await comprehend.detectSentiment(params).promise();
            console.log(JSON.stringify(result.Sentiment));
            let sentimentData = result.Sentiment;
            //Store result in dynamodb DataSentiment
            
            let params1 = {
                TableName: "DataSentiment",
                Item: {
                    "Currency": { S: currency },
                    "NewsTimeStamp": { N: timeStamp.toString() },
                    "SentimentData": { S: sentimentData }
                }
            };
            await ddb.putItem(params1).promise();
        }
    }
};
