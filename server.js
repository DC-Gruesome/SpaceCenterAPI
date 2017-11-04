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

// ---------------------- MONGODB Database -----------------------------------
// Connect to the database
var databaseUrl = "mongodb://admin@ds119302.mlab.com:19302/heroku_gtqcb99j?3t.databases=heroku_gtqcb99j&3t.uriVersion=2&3t.connection.name=SpaceCenter&3t.connectionMode=direct&readPreference=primary";
var collections = ["open_jobs", "archived_jobs"];
var db = mongoJS(databaseUrl, collections);

db.on('connect', function() {
    console.log(">>> Database connected!!");
});

//======================= API Functions ===============================

app.get('/news', rssfeed);
app.get('/news/test', rssfeed_test);

function rssfeed(req, res){
    var rssfeed_all = [];

    feed("http://spacenews.com/feed/", function(err, articles) {
        if (err) return err;
        rssfeed_all.push(articles);
        
        feed("https://www.universetoday.com/universetoday.xml", function(err, articles) {
            if (err) return err;

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
    feed("http://feeds.feedblitz.com/dailygalaxy&x=1", function(err, articles) {
        console.log(err);
        if (err) return err;
        console.log(articles);
        return res.status(200).send(articles);
        });
            
}

//------------------------- Server start listening ----------------------
app.listen(port);
console.log('========= listening on port ' + port + ' =========');

