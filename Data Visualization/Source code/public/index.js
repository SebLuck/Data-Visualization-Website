//Open connection
 const connection = new WebSocket("wss://874atwy1ik.execute-api.us-east-1.amazonaws.com/prod");


// object which will store the timestamp, price, sentiment and prediction of each currency.
 let plotData = {
    BTC: {
        actual: {
            timestamp: [],
            price: []
        },
        sentiment: [],
        prediction: []
    },
    ETH: {
        actual: {
            timestamp: [],
            price: []
        },
        sentiment: [],
        prediction: []
    },
    USDT: {
        actual: {
            timestamp: [],
            price: []
        },
        sentiment: [],
        prediction: []
    },
    BNB: {
        actual: {
            timestamp: [],
            price: []
        },
        sentiment: [],
        prediction: []
    },
    LTC: {
        actual: {
            timestamp: [],
            price: []
        },
        sentiment: [],
        prediction: []
    }
}
 connection.onopen = function(event){
     console.log("Connected: " + JSON.stringify(event));
     setTimeout(getCryptoData, 5000);
 };

 //Function that will get all data when a client connects to the website.
 function getCryptoData(){
    
    //get bitcoin data
    const objectBTC = {
       action: "getDataBTC",
       data: "BTC_Data"
    };
    //get ethereum data
    const objectETH = {
       action: "getDataETH",
       data: "ETH_Data"
    };
    //get tether data
    const objectUSDT = {
       action: "getDataUSDT",
       data: "USDT_Data"
    };
    //get binance coin data
    const objectBNB = {
       action: "getDataBNB",
       data: "BNB_Data"
    };
    //get litecoin data
    const objectLTC = {
       action: "getDataLTC",
       data: "LTC_Data"
    };

    //Send message to the server
    connection.send(JSON.stringify(objectBTC));
    console.log("Message sent: " + JSON.stringify(objectBTC));
    connection.send(JSON.stringify(objectETH));
    console.log("Message sent: " + JSON.stringify(objectETH));
    connection.send(JSON.stringify(objectUSDT));
    console.log("Message sent: " + JSON.stringify(objectUSDT));
    connection.send(JSON.stringify(objectBNB));
    console.log("Message sent: " + JSON.stringify(objectBNB));
    connection.send(JSON.stringify(objectLTC));
    console.log("Message sent: " + JSON.stringify(objectLTC));

    /* Function that will get the message from the server.
    It will return an object which have the numerical, sentiment
    and prediction data.*/
    connection.onmessage = function(crypto){  
        const cryptoJSON = JSON.stringify(crypto.data);
        const cryptoData = JSON.parse(crypto.data);
        console.log("Numerical: " + cryptoJSON);
        /*This for loop will loop through all the numerical data stored in dynamodb.
        It will add all the timestamps and prices in the object plotData for each currency.
         */
        for(let i = 0; i < cryptoData.numerical.length; i++){
            //Get data from event
            let price = cryptoData.numerical[i].Price;
            let currencyNumerical = cryptoData.numerical[i].Currency;
            let timeStamp = cryptoData.numerical[i].CryptoTimeStamp;
            
            let date = new Date(timeStamp * 1000);
            date.toDateString();
            if(currencyNumerical === "Bitcoin"){
                plotData.BTC.actual.timestamp.push(date);
                plotData.BTC.actual.price.push(price);
            }else if(currencyNumerical === "Ethereum"){
                plotData.ETH.actual.timestamp.push(date);
                plotData.ETH.actual.price.push(price);
            }else if(currencyNumerical === "Tether"){
                plotData.USDT.actual.timestamp.push(date);
                plotData.USDT.actual.price.push(price);                     
            }else if(currencyNumerical === "Litecoin"){
                plotData.LTC.actual.timestamp.push(date);
                plotData.LTC.actual.price.push(price);   
            }else{
                plotData.BNB.actual.timestamp.push(date);
                plotData.BNB.actual.price.push(price);                          
            }            
        }
        // Check if the sentiment table is empty 
        let isEmptySentiment = cryptoData.sentiment;
        /*If it is empty it will not add any data to the array sentiment
        from the plotData object.*/
        if(isEmptySentiment.length !== 0){
            // get the current currency which 
            let currentCurrency = cryptoData.sentiment[0].Currency;
            /* This if statement will set each element of the sentiment data array to empty.
             This is to make sure that when a sentiment data is added to the database, it does
              not duplicate any of the previously added data.*/
            if(currentCurrency === "Bitcoin"){
                plotData.BTC.sentiment = [];
            }else if(currentCurrency === "Ethereum"){
                plotData.ETH.sentiment = [];
            }else if(currentCurrency === "Tether"){
                plotData.USDT.sentiment = [];
            }else if(currentCurrency === "Litecoin"){
                plotData.LTC.sentiment = [];
            }else{
                plotData.BNB.sentiment = [];
            }
        }
        /*For loop to add sentiment data to each array sentiment in the plotData object.*/
        for(let i = 0; i < cryptoData.sentiment.length; i++){
            let sentiments = cryptoData.sentiment[i].SentimentData;
            let currencySentiment = cryptoData.sentiment[i].Currency;
            
            if(currencySentiment === "Bitcoin"){
                plotData.BTC.sentiment.push(sentiments);
            }else if(currencySentiment === "Ethereum"){
                plotData.ETH.sentiment.push(sentiments);
            }else if(currencySentiment === "Tether"){
                plotData.USDT.sentiment.push(sentiments);
            }else if(currencySentiment === "Litecoin"){
                plotData.LTC.sentiment.push(sentiments);
            }else{
                plotData.BNB.sentiment.push(sentiments);
            }
        }
        // check if the numerical data table is empty
        let isEmptyNumerical = cryptoData.numerical;
        if(isEmptyNumerical.length !== 0){
            // Get the current currency
            let currency = cryptoData.numerical[0].Currency;
            // if statement that will add the prediction to each array in the plotData object
            if(currency === "Bitcoin"){
                plotData.BTC.prediction = cryptoData.prediction;
            }else if(currency === "Ethereum"){
                plotData.ETH.prediction = cryptoData.prediction;
            }else if(currency === "Tether"){
                plotData.USDT.prediction = cryptoData.prediction;
            }else if(currency === "Litecoin"){
                plotData.LTC.prediction = cryptoData.prediction;
            }else{
                plotData.BNB.prediction = cryptoData.prediction;
            }
        }

        drawNumericalGraph(plotData);
        drawSentimentGraph(plotData);
       
    }
}

// Function that will plot the numerical and prediction data in a line graph
function drawNumericalGraph(cryptoData){
    // Get the array of timestamp and price
    let datesBTC = cryptoData.BTC.actual.timestamp;
    let priceBTC = cryptoData.BTC.actual.price;
    
    // Sort the date array
    let dataBTC = datesBTC.map((date, index) => ({
        x: new Date(date),
        y: priceBTC[index]
    }));
    
    dataBTC.sort((a, b) => a.x - b.x);
    
    let sortDateBTC = dataBTC.map(item => item.x);
    let sortPriceBTC = dataBTC.map(item => item.y);
    //Array that will store the date of each prediction
    let bitcoinPredictionX = [];
    // Array that stores the prediction price
    let bitcoinPredictionY = cryptoData.BTC.prediction;
    // Get the last date 
    let endDateBTC = sortDateBTC[sortDateBTC.length - 1];
    let dateBTC = new Date(endDateBTC);
    /*For loop that will get each date of the prediction.*/
    for(let i = 0; i < bitcoinPredictionY.length; i++) {
        dateBTC.setDate(dateBTC.getDate() + 4);
        bitcoinPredictionX.push(new Date(dateBTC));
    }
    

    //Data set details. Each trace corresponds to one line or set of points.
    let bitcoinTrace = {
        x: sortDateBTC,
        y: sortPriceBTC,
        type: "scatter",
        mode: "line",
        name: "Bitcoin",
        line: {
            color: 'rgb(255,0,0)',
            width: 5
        }
    };
    // Prediction trace
    let predictionBTC = {
        x: bitcoinPredictionX,
        y: bitcoinPredictionY,
        type: "scatter",
        mode: "line",
        name: "Bitcoin Prediction",
        line: {
            color: 'rgb(255,255,0)',
            width: 5
        }
    };

    let datesETH = cryptoData.ETH.actual.timestamp;
    let priceETH = cryptoData.ETH.actual.price;

    let dataETH = datesETH.map((date, index) => ({
        x: new Date(date),
        y: priceETH[index]
    }));
    
    dataETH.sort((a, b) => a.x - b.x);
    
    let sortDateETH = dataETH.map(item => item.x);
    let sortPriceETH = dataETH.map(item => item.y);

    let ethereumPredictionX = [];
    let ethereumPredictionY =  cryptoData.ETH.prediction;
    let endDateETH = sortDateETH[sortDateETH.length - 1];
    let dateETH = new Date(endDateETH);
    for(let i = 0; i < ethereumPredictionY.length; i++) {
        dateETH.setDate(dateETH.getDate() + 4);
        ethereumPredictionX.push(new Date(dateETH));
    }
    
    let ethereumTrace = {
        x: sortDateETH,
        y: sortPriceETH,
        type: "scatter",
        mode: "line",
        name: "Ethereum",
        line: {
            color: 'rgb(138,43,226)',
            width: 5
        }
    };

    let predictionETH = {
        x: ethereumPredictionX,
        y: ethereumPredictionY,
        type: "scatter",
        mode: "line",
        name: "Ethereum Prediction",
        line: {
            color: 'rgb(255,255,0)',
            width: 5
        }
    };

    let datesUSDT = cryptoData.USDT.actual.timestamp;
    let priceUSDT = cryptoData.USDT.actual.price;

    let dataUSDT = datesUSDT.map((date, index) => ({
        x: new Date(date),
        y: priceUSDT[index]
    }));
    
    dataUSDT.sort((a, b) => a.x - b.x);
    
    let sortDateUSDT = dataUSDT.map(item => item.x);
    let sortPriceUSDT = dataUSDT.map(item => item.y);

    let tetherPredictionX = [];
    let tetherPredictionY =  cryptoData.USDT.prediction;

    let endDateUSDT = sortDateUSDT[sortDateUSDT.length - 1];
    let dateUSDT = new Date(endDateUSDT);
    for(let i = 0; i < tetherPredictionY.length; i++) {
        dateUSDT.setDate(dateUSDT.getDate() + 4);
        tetherPredictionX.push(new Date(dateUSDT));
    }

    let tetherTrace = {
        x: sortDateUSDT,
        y: sortPriceUSDT,
        type: "scatter",
        mode: "line",
        name: "Tether",
        line: {
            color: 'rgb(0,128,128)',
            width: 5
        }
    };

    let predictionUSDT = {
        x: tetherPredictionX,
        y: tetherPredictionY,
        type: "scatter",
        mode: "line",
        name: "Tether Prediction",
        line: {
            color: 'rgb(255,255,0)',
            width: 5
        }
    };

    let datesBNB = cryptoData.BNB.actual.timestamp;
    let priceBNB = cryptoData.BNB.actual.price;

    let dataBNB = datesBNB.map((date, index) => ({
        x: new Date(date),
        y: priceBNB[index]
    }));
    
    dataBNB.sort((a, b) => a.x - b.x);
    
    let sortDateBNB = dataBNB.map(item => item.x);
    let sortPriceBNB = dataBNB.map(item => item.y);

    let binanceCoinPredictionX = [];
    let binanceCoinPredictionY =  cryptoData.BNB.prediction;

    let endDateBNB = sortDateBNB[sortDateBNB.length - 1];
    let dateBNB = new Date(endDateBNB);
    for(let i = 0; i < binanceCoinPredictionY.length; i++) {
        dateBNB.setDate(dateBNB.getDate() + 4);
        binanceCoinPredictionX.push(new Date(dateBNB));
    }

    let binanceCoinTrace = {
        x: sortDateBNB,
        y: sortPriceBNB,
        type: "scatter",
        mode: "line",
        name: "Binance Coin",
        line: {
            color: 'rgb(255,140,0)',
            width: 5
        }
    };

    let predictionBNB = {
        x: binanceCoinPredictionX,
        y: binanceCoinPredictionY,
        type: "scatter",
        mode: "line",
        name: "Binance Coin Prediction",
        line: {
            color: 'rgb(255,255,0)',
            width: 5
        }
    };


    let datesLTC = cryptoData.LTC.actual.timestamp;
    let priceLTC = cryptoData.LTC.actual.price;

    let dataLTC = datesLTC.map((date, index) => ({
        x: new Date(date),
        y: priceLTC[index]
    }));
    
    dataLTC.sort((a, b) => a.x - b.x);
    
    let sortDateLTC = dataLTC.map(item => item.x);
    let sortPriceLTC = dataLTC.map(item => item.y);

    let litecoinPredictionX = [];
    let litecoinPredictionY =  cryptoData.LTC.prediction;
    let endDateLTC = sortDateLTC[sortDateLTC.length - 1];
    let dateLTC = new Date(endDateLTC);
    for(let i = 0; i < litecoinPredictionY.length; i++) {
        dateLTC.setDate(dateLTC.getDate() + 4);
        litecoinPredictionX.push(new Date(dateLTC));
    }

    let litecoinTrace = {
        x: sortDateLTC,
        y: sortPriceLTC,
        type: "scatter",
        mode: "line",
        name: "Litecoin",
        line: {
            color: 'rgb(0,0,255)',                                                                          
            width: 5
        }
    };

    let predictionLTC = {
        x: litecoinPredictionX,
        y: litecoinPredictionY,
        type: "scatter",
        mode: "line",
        name: "Litecoin Prediction",
        line: {
            color: 'rgb(255,255,0)',
            width: 5
        }
    };
    //Complete data set for graph
    dataBTC = [bitcoinTrace, predictionBTC];
    dataETH = [ethereumTrace, predictionETH];
    dataUSDT = [tetherTrace, predictionUSDT];
    dataBNB = [binanceCoinTrace, predictionBNB];
    dataLTC = [litecoinTrace, predictionLTC];
    //Specify title and axis labels for each currency
    let layoutBTC = {
        autosize: true,
        title: {  
            text: 'Historical Bitcoin Data',
            font: {
                color: "rgb(255,0,0)",
                size: 24
            }
        },
        xaxis: {
            title: {
                text: "Date",
                font: {
                    color: "rgb(255,0,0)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        yaxis: {                                                                                                    
            title: {
                text: "Prices in $",
                font: {
                    color: "rgb(255,0,0)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        margin: { t: 100 },
        plot_bgcolor: 'black',
        paper_bgcolor: 'black',
        font:{
            color: "white"
        }
    };
    let layoutETH = {
        autosize: true,
        title: {  
            text: 'Historical Ethereum Data',
            font: {
                color: "rgb(138,43,226)",
                size: 24
            }
        },
        xaxis: {
            title: {
                text: "Date",
                font: {
                    color: "rgb(138,43,226)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        yaxis: {                                                                                                    
            title: {
                text: "Prices in $",
                font: {
                    color: "rgb(138,43,226)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        margin: { t: 100 },
        plot_bgcolor: 'black',
        paper_bgcolor: 'black',
        font:{
            color: "white"
        }
    };
    let layoutUSDT = {
        autosize: true,
        title: {  
            text: 'Historical Tether Data',
            font: {
                color: "rgb(0,128,128)",
                size: 24
            }
        },
        xaxis: {
            title: {
                text: "Date",
                font: {
                    color: "rgb(0,128,128)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        yaxis: {                                                                                                    
            title: {
                text: "Prices in $",
                font: {
                    color: "rgb(0,128,128)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        margin: { t: 100 },
        plot_bgcolor: 'black',
        paper_bgcolor: 'black',
        font:{
            color: "white"
        }
    };
    let layoutBNB = {
        autosize: true,
        title: {  
            text: 'Historical Binance Coin Data',
            font: {
                color: "rgb(255,140,0)",
                size: 24
            }
        },
        xaxis: {
            title: {
                text: "Date",
                font: {
                    color: "rgb(255,140,0)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        yaxis: {                                                                                                    
            title: {
                text: "Prices in $",
                font: {
                    color: "rgb(255,140,0)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        margin: { t: 100 },
        plot_bgcolor: 'black',
        paper_bgcolor: 'black',
        font:{
            color: "white"
        }
    };
    let layoutLTC = {
        autosize: true,
        title: {  
            text: 'Historical Litecoin Data',
            font: {
                color: "rgb(0,0,255)",
                size: 24
            }
        },
        xaxis: {
            title: {
                text: "Date",
                font: {
                    color: "rgb(0,0,255)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        yaxis: {                                                                                                    
            title: {
                text: "Prices in $",
                font: {
                    color: "rgb(0,0,255)",
                    size: 20
                },
                standoff: 20
            },
            gridcolor: "lightgray"
        },
        margin: { t: 100 },
        plot_bgcolor: 'black',
        paper_bgcolor: 'black',
        font:{
            color: "white"
        }
    };

    //Draw the graphs
    Plotly.newPlot('cryptoBTC', dataBTC, layoutBTC);
    Plotly.newPlot('cryptoETH', dataETH, layoutETH);
    Plotly.newPlot('cryptoUSDT', dataUSDT, layoutUSDT);
    Plotly.newPlot('cryptoBNB', dataBNB, layoutBNB);
    Plotly.newPlot('cryptoLTC', dataLTC, layoutLTC);
}
// Function that will draw a pie chart for the sentiment analysis
 function drawSentimentGraph(sentimentData){
        console.log("sentiment: " + JSON.stringify(sentimentData));
        let btcData = sentimentData.BTC.sentiment;
        let positiveBTC = 0;
        let negativeBTC = 0;
        let neutralBTC = 0;
        /* This for loop will iterate through the bitcoin sentiment array to find the percentage
        of the positive, negative and neutral sentiment data.*/
        for(let i = 0; i < btcData.length; i++){
            if(btcData[i] === "POSITIVE"){
                positiveBTC++;
            }else if(btcData[i] === "NEGATIVE"){
                negativeBTC++;
            }else{
                neutralBTC++;
            }
        }
        // Create the pie chart 
        let bitcoinChart = [{
            values: [positiveBTC, negativeBTC, neutralBTC],
            labels: ['Positive', 'Negative', 'Neutral'],
            type: 'pie',
            marker: {
                colors: ['rgb(44, 160, 44)', 'darkred', 'rgb(105,105,105)'],
                line: {
                color: 'white',
                width: 2
                }
            }
        }];
        let ethData = sentimentData.ETH.sentiment;
        let positiveETH = 0;
        let negativeETH = 0;
        let neutralETH = 0;
        for(let i = 0; i < ethData.length; i++){
            if(ethData[i] === "POSITIVE"){
                positiveETH++;
            }else if(ethData[i] === "NEGATIVE"){
                negativeETH++;
            }else{
                neutralETH++;
            }
        }
        let ethereumChart = [{
            values: [positiveETH, negativeETH, neutralETH],
            labels: ['Positive', 'Negative', 'Neutral'],
            type: 'pie',
            marker: {
                colors: ['rgb(44, 160, 44)', 'darkred', 'rgb(105,105,105)'],
                line: {
                color: 'white',
                width: 2
                }
            }
        }];
        let usdtData = sentimentData.USDT.sentiment;
        let positiveUSDT = 0;
        let negativeUSDT = 0;
        let neutralUSDT = 0;
        for(let i = 0; i < usdtData.length; i++){
            if(usdtData[i] === "POSITIVE"){
                positiveUSDT++;
            }else if(usdtData[i] === "NEGATIVE"){
                negativeUSDT++;
            }else{
                neutralUSDT++;
            }
        }
        let tetherChart = [{
            values: [positiveUSDT, negativeUSDT, neutralUSDT],
            labels: ['Positive', 'Negative', 'Neutral'],
            type: 'pie',
            marker: {
                colors: ['rgb(44, 160, 44)', 'darkred', 'rgb(105,105,105)'],
                line: {
                color: 'white',
                width: 2
                },

            }
        }];
        let bnbData = sentimentData.BNB.sentiment;
        let positiveBNB = 0;
        let negativeBNB = 0;
        let neutralBNB = 0;
        for(let i = 0; i < bnbData.length; i++){
            if(bnbData[i] === "POSITIVE"){
                positiveBNB++;
            }else if(bnbData[i] === "NEGATIVE"){
                negativeBNB++;
            }else{
                neutralBNB++;
            }
        }
        let binanceCoinChart = [{
            values: [positiveBNB, negativeBNB, neutralBNB],
            labels: ['Positive', 'Negative', 'Neutral'],
            type: 'pie',
            marker: {
                colors: ['rgb(44, 160, 44)', 'darkred', 'rgb(105,105,105)'],
                line: {
                color: 'white',
                width: 2
                },

            }
        }];
        let ltcData = sentimentData.LTC.sentiment;
        let positiveLTC = 0;
        let negativeLTC = 0;
        let neutralLTC = 0;
        for(let i = 0; i < ltcData.length; i++){
            if(ltcData[i] === "POSITIVE"){
                positiveLTC++;
            }else if(ltcData[i] === "NEGATIVE"){
                negativeLTC++;
            }else{
                neutralLTC++;
            }
        }
        let litecoinChart = [{
            values: [positiveLTC, negativeLTC, neutralLTC],
            labels: ['Positive', 'Negative', 'Neutral'],
            type: 'pie',
            marker: {
                colors: ['rgb(44, 160, 44)', 'darkred', 'rgb(105,105,105)'],
                line: {
                color: 'white',
                width: 2
                },

            }
        }];
        // set the layout for each currency
        let layoutBitcoin = {
            height: 450,
            width: 450,
            title: {
                text: "Bitcoin Sentiment Analysis",
                font: {
                    color: 'white',
                }
            },
            plot_bgcolor: 'white',
            paper_bgcolor: 'rgb(255,0,0)',
            legend: {
                font: {
                color: 'white'
                }
            }
        };

        let layoutEthereum = {
            height: 450,
            width: 450,
            title: {
                text: "Ethereum Sentiment Analysis",
                font: {
                    color: 'white'
                }
            },
            plot_bgcolor: 'white',
            paper_bgcolor: 'rgb(75,0,130)',
            legend: {
                font: {
                color: 'white'
                }
            }
        };

        let layoutTether = {
            height: 450,
            width: 450,
            title: {
                text: "Tether Sentiment Analysis",
                font: {
                    color: 'white'
                }
            },
            plot_bgcolor: 'white',
            paper_bgcolor: 'rgb(0,128,128)',
            legend: {
                font: {
                color: 'white'
                }
            }
        };

        let layoutBinanceCoin = {
            height: 450,
            width: 450,
            title: {
                text: "Binance Coin Sentiment Analysis",
                font: {
                    color: 'white'
                }
            },
            plot_bgcolor: 'white',
            paper_bgcolor: 'rgb(255,140,0)',
            legend: {
                font: {
                color: 'white'
                }
            }
        };

        let layoutLitecoin = {
            height: 450,
            width: 450,
            title: {
                text: "Litecoin Sentiment Analysis",
                font: {
                    color: 'white'
                }
            },
            plot_bgcolor: 'white',
            paper_bgcolor: 'rgb(0,0,128)',
            legend: {
                font: {
                color: 'white'
                }
            }
        };
        // Draw the 5 pie charts
        Plotly.newPlot('sentimentBTC', bitcoinChart, layoutBitcoin);
        Plotly.newPlot('sentimentETH', ethereumChart, layoutEthereum);
        Plotly.newPlot('sentimentUSDT', tetherChart, layoutTether);
        Plotly.newPlot('sentimentBNB', binanceCoinChart, layoutBinanceCoin);
        Plotly.newPlot('sentimentLTC', litecoinChart, layoutLitecoin);
}
    

