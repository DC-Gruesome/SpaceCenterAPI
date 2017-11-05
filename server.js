'use strict';
var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');
var path = require('path');
var dateFormat = require('dateformat');
var numeral = require('numeral');
var mongoJS = require('mongojs');
var cron = require("cron");
var feed = require("feed-read");
var fetch = require("fetch").fetchUrl;

// use body-parser so we can grab information from POST requests
var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
var port = process.env.PORT || 8080;

// ---------------------- MYSQL Database -----------------------------------
// var mysql = require('mysql');

// var connection = mysql.createConnection({
//     host     : "stellardb.cdcasudfn9ih.us-east-1.rds.amazonaws.com",
//     port     : 3306,
//     user     : "destronaut",
//     password : "sodacitycosmos",
//     database : 'jobsdb',
// });

// connection.connect(function(err) {
//   if (err) {
//     console.error('Database connection failed: ' + err.stack);
//     return;
//   }

//   console.log('Connected to database.');
// });

// // [4] Query the database
// connection.query("SELECT * FROM Jobs;", function (error, results, fields) {
//     if (error) console.log(error);
//     console.log('The Jobs: ');
//     console.log(results);
// });
  
// connection.end();

// ---------------------- MONGODB Database -----------------------------------
// Connect to the database
var databaseUrl = "mongodb://admin:admin@ds119302.mlab.com:19302/heroku_gtqcb99j";
var collections = ["jobs", "archived_jobs"];
var db = mongoJS(databaseUrl, collections);

db.on('connect', function() {
    console.log(">>> Database connected!!");
});

db.on('error', function(err) {
    console.log('database error', err)
    console.log(">>> Error in Database connection!!");
});

//======================= NEWS APIs ===============================
app.get('/news', rssfeed);
app.get('/news/test', rssfeed_test);

//======================= JOBS APIs ===============================
app.get('/jobs', getjobs);
app.post('/jobs/create', createjobs);

//-------------------
function createjobs(req, res){
    return res.status(200).send(null);
}

function getjobs(req, res){
    db.jobs.find(function (err, docs) {
        // docs is an array of all the documents in mycollection 
        if (err){
            console.log(err);
            return res.status(400).send(err);
        }
        return res.status(200).send(docs);
    });     
}

//------------------ RSS NEWS
function rssfeed(req, res){
    var rssfeed_all = [];

    feed("http://spacenews.com/feed/", function(err, articles) {
        if (err) return err;
        rssfeed_all.push(articles);
        
        feed("https://www.universetoday.com/universetoday.xml", function(err, articles) {
            if (err) return err;
            rssfeed_all.push(articles);
            
            feed("http://feeds.feedblitz.com/dailygalaxy&x=1", function(err, articles) {
                if (err) return err;
                rssfeed_all.push(articles);

                // Each article has the following properties:
                //   * "title"     - The article title (String).
                //   * "author"    - The author's name (String).
                //   * "link"      - The original article link (String).
                //   * "content"   - The HTML content of the article (String).
                //   * "published" - The date that the article was published (Date).
                //   * "feed"      - {name, source, link}

                // console.log(rssfeed_all);
                return res.status(200).send(rssfeed_all);
        });
        });    
    });
}

function rssfeed_space(){
    feed("https://www.space.com/home/feed/site.xml", function(err, articles) {
        console.log(err);
        if (err) return err;
        // console.log(articles);
        return (articles);
    });
            
}
    
function rssfeed_test(req, res){
    feed("https://www.nasa.gov/rss/dyn/glenn_features.rss", function(err, articles) {
        console.log(err);
        if (err) return err;
        for (let i=0; i < articles.length; i++){
            let url = articles[i].link;
            if (url){
                fetch(url, function(error, meta, body){
                    console.log(url);
                    articles[i].content = body.toString();
                });
            }
        }
        console.log(articles);
        return res.status(200).send(articles);
    });
            
}

//------------------------- Server start listening ----------------------
app.listen(port);
console.log('========= listening on port ' + port + ' =========');

