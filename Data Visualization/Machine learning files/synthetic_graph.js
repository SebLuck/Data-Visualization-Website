//Axios will handle HTTP requests to web service
const axios = require ('axios');
let AWS = require("aws-sdk");
//Set region
AWS.config.update({region:'us-east-1'});
//The ID of the student's data that I will download
let studentID = 'M00741392';

//URL where student data is available
let url = 'https://bmmkl4lj0d.execute-api.us-east-1.amazonaws.com/prod/';


//Data that we are going to send to endpoint
let endpointData = {
    "instances":
        [
            {
                "start":"2023-01-05 02:00:00",
                "target": [379.62305661496464,383.0943001781239,376.02056336558826,390.7576020774896,374.5169198994948,389.11122741637445,388.2878698223649,391.52196952148375,389.53080255089327,424.5996569529016,429.60265131149197,433.19881522576566,410.33870706356186,438.38006283774513,448.8135889355642,427.2483393662958,426.1504638880884,430.2248914249522,440.8128176066572,430.489488451597,431.22241926036645,391.0205275666576,386.66869708931097,412.4190459982319,378.42607800639354,387.46820742784513,371.04864901191326,394.6468895762671,383.67531313814,385.65487894600335,387.8395945400421,406.0790523565689,430.7296423778995,407.7305622693844,429.97355913687915,454.7574510087906,459.2896424917034,442.11462035248445,452.47889005804524,456.06163253946113,467.7435846885952,439.6408201447598,457.91317416537424,450.51261493808414,440.2775960289492,402.42228070706193,422.1835364765674,402.0674335460435,402.7930629916052,420.6152113409307,415.23074659892444,396.05528981372134,397.9649347555531,399.73193958632083,436.71249945832244,432.6606019465286,440.25630378102136,423.7330119550812,434.0812702240644,437.9433620125007,452.23901864451557,477.7599287951334,474.78895274597136,474.9484570496991,452.3403077260195,443.06022346983394,443.2266497951558,456.08501263663027,423.0923645732698,449.41046283861886,415.2020494370211,406.0502132597067,417.2778633462693,433.21522433614666,419.85371326129496,432.17582676009323,419.33836391166653,419.60597536281443,440.40504444095245,440.6386525488929,465.3670964142618,456.6353945944412,447.0070750272653,492.64136614163414,480.9873579253472,502.1914264064172,495.3786867692244,493.5792870316888,467.49745876508484,496.0691228207915,469.6376210644182,458.4633534881044,446.03780827041504,430.5798679440074,463.4769056817904,452.6483693068377,436.7016534792146,428.19305391110413,457.8489507394195,444.0519430613525]
            }
        ],
    "configuration":
        {
            "num_samples": 50,
            "output_types":["mean","quantiles","samples"],
            "quantiles":["0.1","0.9"]
        }
};

//Authentication details for Plotly
const PLOTLY_USERNAME = 'luckseb037';
const PLOTLY_KEY = 'GyvdHegUAuUNqyOLC1An';

//Initialize Plotly with user details.
let plotly = require('plotly')(PLOTLY_USERNAME, PLOTLY_KEY);

//Name of endpoint
const endpointName = "SyntheticEndPoint";
//Parameters for calling endpoint
let params = {
    EndpointName: endpointName,
    Body: JSON.stringify(endpointData),
    ContentType: "application/json",
    Accept: "application/json"
};
let xValues = [];
let yValues = [];
console.log(JSON.stringify(params));
//AWS class that will query endpoint
let awsRuntime = new AWS.SageMakerRuntime({});
exports.handler = async (event) => {
    //Call endpoint and handle response
    awsRuntime.invokeEndpoint(params, async (err, data)=>{
        if (err) {//An error occurred
            console.log(err, err.stack);

            //Return error response
            const response = {
                statusCode: 500,
                body: JSON.stringify('ERROR: ' + JSON.stringify(err)),
            };
            return response;
        }
        else{//Successful response
            //Get synthetic data
            yValues = (await axios.get(url + studentID)).data.target;
            // The variable counter_time will save the last value for the x coordinate
            let counter_time = 0;
            //Add basic X values for plot
            for(let i=0; i<yValues.length; i++){
                xValues.push(i);
                counter_time = i;
            }
            let responseData = JSON.parse(Buffer.from(data.Body).toString('utf8'));

            let yValuesMean = responseData.predictions[0].mean
            let yValuesQuantiles1 = responseData.predictions[0].quantiles["0.1"];
            let yValuesQuantiles2 = responseData.predictions[0].quantiles["0.9"];
            let xValuesPrediction = [];
            // Add the x values prediction
            for(let i=0; i < yValuesMean.length; i++){
                counter_time++;
                xValuesPrediction.push(counter_time);
            }
            // console.log(yValuesMean);
            //Call function to plot data
            let plotResult = await plotData(studentID, xValues, yValues, yValuesMean, xValuesPrediction, yValuesQuantiles1, yValuesQuantiles2);
            console.log("Plot for student '" + studentID + "' available at: " + plotResult.url);
            //Return successful response
            const response = {
                statusCode: 200,
                body: JSON.stringify('Predictions stored.'),
            };
            return response;
        }
    });
    
};

//Plots the specified data
async function plotData(studentID, xValues, yValues, yValuesMean, xValuesPrediction, yValuesQuantiles1, yValuesQuantiles2){
    //Data structure
    let studentData = {
        x: xValues,
        y: yValues,
        type: "scatter",
        mode: 'line',
        name: "Original Data",
        marker: {
            color: 'rgb(219, 64, 82)',
            size: 12
        }
    };
    let predictionMean = {
        x: xValuesPrediction,
        y: yValuesMean,
        type: "scatter",
        mode: 'line',
        name: "Mean",
        marker: {
            color: 'rgb(255,255,0)',
            size: 12
        }
    }
    let predictionQuantiles1 = {
        x: xValuesPrediction,
        y: yValuesQuantiles1,
        type: "scatter",
        mode: 'line',
        name: "Prediction 0.1 Quantile",
        marker: {
            color: 'rgb(154,205,50)',
            size: 12
        }
    }
    let predictionQuantiles2 = {
        x: xValuesPrediction,
        y: yValuesQuantiles2,
        type: "scatter",
        mode: 'line',
        name: "Prediction 0.9 Quantile",
        marker: {
            color: 'rgb(0,255,0)',
            size: 12
        }
    }
    let data = [studentData, predictionMean, predictionQuantiles1, predictionQuantiles2];

    let layout = {
        title: "Synthetic Data for Student " + studentID,
        font: {
            size: 25
        },
        xaxis: {
            title: 'Time (hours)'
        },
        yaxis: {
            title: 'Value'
        }
    };
    let graphOptions = {
        layout: layout,
        filename: "date-axes",
        fileopt: "overwrite"
    };

    return new Promise ( (resolve, reject)=> {
        plotly.plot(data, graphOptions, function (err, msg) {
            if (err)
                reject(err);
            else {
                resolve(msg);
            }
        });
    });
};
exports.handler({});