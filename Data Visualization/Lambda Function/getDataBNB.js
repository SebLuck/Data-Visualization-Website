//Import external library with websocket functions
let ws = require('websocket');
let AWS = require('aws-sdk');
//Hard coded domain name and stage - use when pushing messages from server to client
let domainName = "874atwy1ik.execute-api.us-east-1.amazonaws.com";
let stage = "prod";
//Set region
AWS.config.update({region:'us-east-1'});
// Endpoints name
const endpointName = "BinanceCoinEndpoint";

const dynamodb = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    try {
          const table1Params = {
            TableName: 'CryptoCurrency',
            KeyConditionExpression: 'Currency = :pkValue',
            ExpressionAttributeValues: {
              ':pkValue': 'Binance Coin'
            }
          };
        const table2Params = {
            TableName: 'DataSentiment',
            KeyConditionExpression: 'Currency = :pkValue',
            ExpressionAttributeValues: {
              ':pkValue': 'Binance Coin'
            }
          };
        const table1Data = await dynamodb.query(table1Params).promise();
        const table2Data = await dynamodb.query(table2Params).promise();
        
        let cryptoData = table1Data.Items;
        
        let actualData ={
          timestamp: [],
          price: []
        }
        for(let i = 0; i < cryptoData.length; i++){
                //Get data from event
                let price = cryptoData[i].Price;
                let timeStamp = cryptoData[i].CryptoTimeStamp;
                
                let date = new Date(timeStamp * 1000);
                date.toDateString();
                actualData.timestamp.push(date);
                actualData.price.push(price);
             
        }
        
        let datesBNB = actualData.timestamp;
        let priceBNB = actualData.price;
        
        let dataBNB = datesBNB.map((date, index) => ({
            x: new Date(date),
            y: priceBNB[index]
        }));
        
        dataBNB.sort((a, b) => a.x - b.x);
        
        let sortDateBNB = dataBNB.map(item => item.x);
        let sortPriceBNB = dataBNB.map(item => item.y);
        
        let startDate = sortDateBNB[sortDateBNB.length - 100];
    
        let date = new Date(startDate);
        let options = {timeZone: "Indian/Mauritius", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"};
        let startingDate = date.toLocaleString("en-US", options).replace(/\//g, '-').replace(',', '').replace(" AM", "");
        let last100Items = [];
        let startIndex = 0;
        if (sortPriceBNB.length >= 100){
            startIndex = sortPriceBNB.length - 100;
        }
        for(let i = startIndex; i < sortPriceBNB.length; i++){
            last100Items.push(sortPriceBNB[i]);
        }
        
        let endpointData = {
            "instances":
                [
                    {
                        "start": startingDate,
                        "target": last100Items
                    }
                ],
            "configuration":
                {
                    "num_samples": 80,
                    "output_types":["mean","quantiles","samples"],
                    "quantiles":["0.1","0.9"]
                }
        };
        //Parameters for calling endpoint
        let params = {
            EndpointName: endpointName,
            Body: JSON.stringify(endpointData),
            ContentType: "application/json"
        };      
        
        //AWS class that will query endpoint
        let awsRuntime = new AWS.SageMakerRuntime({});
        let result = await awsRuntime.invokeEndpoint(params).promise();

        let responseData = JSON.parse(Buffer.from(result.Body).toString('utf8'));

        let binanceCoinPrediction = [];
        for(let i = 0; i < responseData.predictions[0].mean.length; i++){
            binanceCoinPrediction.push(responseData.predictions[0].mean[i]);
        }
        
        const combinedData = {
            numerical: table1Data.Items,
            sentiment: table2Data.Items,
            prediction: binanceCoinPrediction
        };
        //Get promises to send messages to connected clients
        let sendDataPromises = await ws.getSendDataPromises(JSON.stringify(combinedData), domainName, stage);
            
        //Execute promises
        await Promise.all(sendDataPromises);        
    }
    catch(err){
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    //Success
    return { statusCode: 200, body: "Data sent successfully." };
};