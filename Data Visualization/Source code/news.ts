
//Module that reads keys from .env file
import dotenv from 'dotenv';

//Use Node module for accessing newsapi
const NewsAPI = require('newsapi');


//Database module
import { saveData } from "./databaseNews";

//Copy variables in file into environment variables
dotenv.config();

//Create new NewsAPI class
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);


//Define structure of data returned from NewsAPI
interface Article {
    description:string,
    publishedAt:string
}

//Define structure of data returned from NewsAPI
interface NewsAPIResult {
    articles:Array<Article>
}
//Pulls and logs data from API
async function getNews(keyword: string):Promise<void>{
    //Search API
    const result:NewsAPIResult = await newsapi.v2.everything({
        q: keyword,
        pageSize: 200,
        language: 'en'
    });

    for(let article of result.articles){
        const date = new Date(article.publishedAt);
        console.log("Unix Time: " + date.getTime() + "; description: " + article.description);
        saveData(date.getTime(), article.description, keyword);
    }

}


getNews("Bitcoin");
getNews("Ethereum");
getNews("Tether");
getNews("Binance Coin");
getNews("Litecoin");
