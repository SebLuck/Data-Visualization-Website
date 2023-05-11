

    let AWS = require("aws-sdk");

    //Tell AWS about region
    AWS.config.update({
        region: "us-east-1",
        endpoint: "https://dynamodb.us-east-1.amazonaws.com"
    });
    // Create date object to get date in UNIX time
    let date: Date = new Date();

    export async function putData(currency:string, price:number, timestamp:number, date:string) {
        //Create new DocumentClient
        let documentClient = new AWS.DynamoDB.DocumentClient();
        
        let primaryKey = {
            "Currency": currency,
            "CryptoTimeStamp": timestamp
        }
        let params = {
            TableName: "CryptoCurrency",
            Key: primaryKey
        };
        documentClient.get(params, async (error: any, data: { Item: any; }) => {
            if (error) {
              console.error('Error retrieving item:', error);
            } else {
              if (data.Item) {
                console.log('Item already exists');
              } else {
                        //Table name and data for table
                let putParams = {
                    TableName: "CryptoCurrency",
                    Item: {
                        Currency: currency,
                        CryptoTimeStamp: timestamp, 
                        Price: price,
                        CryptoDate: date
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
            }
        });
    }

