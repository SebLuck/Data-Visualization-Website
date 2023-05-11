"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Module that reads keys from .env file
const dotenv_1 = __importDefault(require("dotenv"));
//Use Node module for accessing newsapi
const NewsAPI = require('newsapi');
//Database module
const databaseNews_1 = require("./databaseNews");
//Copy variables in file into environment variables
dotenv_1.default.config();
//Create new NewsAPI class
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
//Pulls and logs data from API
async function getNews(keyword) {
    //Search API
    const result = await newsapi.v2.everything({
        q: keyword,
        pageSize: 200,
        language: 'en'
    });
    for (let article of result.articles) {
        const date = new Date(article.publishedAt);
        console.log("Unix Time: " + date.getTime() + "; description: " + article.description);
        (0, databaseNews_1.saveData)(date.getTime(), article.description, keyword);
    }
}
getNews("Bitcoin");
getNews("Ethereum");
getNews("Tether");
getNews("Binance Coin");
getNews("Litecoin");
