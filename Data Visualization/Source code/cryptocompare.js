"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseCrypto_1 = require("./databaseCrypto");
//Axios will handle HTTP requests to web service
const axios_1 = __importDefault(require("axios"));
//Reads keys from .env file
const dotenv_1 = __importDefault(require("dotenv"));
//Copy variables in file into environment variables
dotenv_1.default.config();
//Class that wraps Cryptocompare web service
class CryptoCompare {
    constructor() {
        //Base URL of cryptocompare API
        this.baseURL = "https://min-api.cryptocompare.com/data/v2/histoday?";
    }
    //Returns a Promise that will get the price and timestamp
    async getPriceTime(currency, limit, aggregate) {
        //Build URL for API call
        let url = this.baseURL + "fsym=" + currency + "&tsym=USD&toTs=-1&limit=" + limit + "&aggregate=" + aggregate +
            "&api_key=" + process.env.CRYPTOCOMPARE_API_KEY;
        try {
            let data = (await axios_1.default.get(url)).data.Data;
            let counter_interval = 0;
            for (let i = 0; i < 500; i++) {
                //Pull data
                let timestamp = data.Data[i].time;
                //convert the timestamp to milliseconds to convert it to date
                let timeMilli = timestamp * 1000;
                let dataString = new Date(timeMilli);
                let date = dataString.toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' });
                let price = data.Data[i].close;
                let currencyName;
                // This if statement will find the currency name 
                if (currency === "BTC") {
                    currencyName = "Bitcoin";
                }
                else if (currency === "ETH") {
                    currencyName = "Ethereum";
                }
                else if (currency === "USDT") {
                    currencyName = "Tether";
                }
                else if (currency === "BNB") {
                    currencyName = "Binance Coin";
                }
                else {
                    currencyName = "Litecoin";
                }
                // sleep the program before adding the data to dynamodb
                counter_interval++;
                if (counter_interval === 100) {
                    console.log("sleep...");
                    await sleep(5000);
                    counter_interval = 0;
                }
                (0, databaseCrypto_1.putData)(currencyName, price, timestamp, date);
            }
        }
        catch (err) {
            console.error("Failed to fetch data: " + err);
        }
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
let cryptoCompare = new CryptoCompare();
cryptoCompare.getPriceTime("BTC", 2000, 4);
cryptoCompare.getPriceTime("ETH", 2000, 4);
cryptoCompare.getPriceTime("USDT", 2000, 4);
cryptoCompare.getPriceTime("BNB", 2000, 4);
cryptoCompare.getPriceTime("LTC", 2000, 4);
