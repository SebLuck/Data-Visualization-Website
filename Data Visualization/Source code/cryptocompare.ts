import { String } from "aws-sdk/clients/acm";
import { putData } from "./databaseCrypto"


//Axios will handle HTTP requests to web service
import axios from 'axios';

//Reads keys from .env file
import dotenv from 'dotenv';

//Copy variables in file into environment variables
dotenv.config();


//Class that wraps Cryptocompare web service


class CryptoCompare {
    //Base URL of cryptocompare API
    baseURL: string = "https://min-api.cryptocompare.com/data/v2/histoday?";
    
    
    //Returns a Promise that will get the price and timestamp
    async getPriceTime(currency: string, limit: number, aggregate: number): Promise<void> {
        //Build URL for API call
        let url:string = this.baseURL + "fsym=" + currency +"&tsym=USD&toTs=-1&limit="+ limit + "&aggregate=" + aggregate +
        "&api_key=" + process.env.CRYPTOCOMPARE_API_KEY;
        try {
            let data = (await axios.get(url)).data.Data;
            let counter_interval:number = 0;
            for(let i:number =0; i < 500; i++){
                //Pull data
                let timestamp:number = data.Data[i].time;

                //convert the timestamp to milliseconds to convert it to date
                let timeMilli:number = timestamp * 1000;
                let dataString = new Date(timeMilli);
                let date:string = dataString.toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' });
                
                let price:number =  data.Data[i].close;
                let currencyName:string;
                // This if statement will find the currency name 
                if(currency === "BTC"){
                    currencyName = "Bitcoin";
                }else if(currency === "ETH"){
                    currencyName = "Ethereum";
                }else if(currency === "USDT"){
                    currencyName = "Tether";
                }else if(currency === "BNB"){
                    currencyName = "Binance Coin";
                }else{
                    currencyName = "Litecoin";
                }
                // sleep the program before adding the data to dynamodb
                counter_interval++
                if(counter_interval === 100){
                    console.log("sleep...");
                    await sleep(5000);
                    counter_interval = 0;
                }
                putData(currencyName, price, timestamp, date);
            }
            
        }
        catch(err){
            console.error("Failed to fetch data: " + err);
        }
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let cryptoCompare: CryptoCompare = new CryptoCompare();
cryptoCompare.getPriceTime("BTC", 2000, 4);
cryptoCompare.getPriceTime("ETH", 2000, 4);
cryptoCompare.getPriceTime("USDT", 2000, 4);
cryptoCompare.getPriceTime("BNB", 2000, 4);
cryptoCompare.getPriceTime("LTC", 2000, 4);
