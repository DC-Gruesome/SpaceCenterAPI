'use strict';
// myBusinessBot
// Version 1.0.1
//
// Getting started with Facebook Messaging Platform
// https://developers.facebook.com/docs/messenger-platform/quickstart

var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');
var path = require('path');
var dateFormat = require('dateformat');
var numeral = require('numeral');
var mongoJS = require('mongojs');
var mongoose = require('mongoose');
var mongooseP = require('mongoose');
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

app.get('/news/all', rssfeed_all);
app.get('/news/spacenews', rssfeed_spacenews);
app.get('/news/space', rssfeed_space);
app.get('/news/universetoday', rssfeed_universetoday);

function rssfeed_all(req, res){
    feed("http://spacenews.com/feed/", function(err, articles) {
        if (err) return err;
        var rssfeed_spacenews = rssfeed_spacenews();

        feed("https://www.space.com/home/feed/site.xml", function(err, articles) {
            if (err) return err;
            var rssfeed_space = articles;

            // Combine all rss feeds
            var rssfeed_all = [];
            rssfeed_all.push(rssfeed_spacenews);
            rssfeed_all.push(rssfeed_space);

            // console.log(rssfeed_all);
            // Each article has the following properties:
            // 
            //   * "title"     - The article title (String).
            //   * "author"    - The author's name (String).
            //   * "link"      - The original article link (String).
            //   * "content"   - The HTML content of the article (String).
            //   * "published" - The date that the article was published (Date).
            //   * "feed"      - {name, source, link}
            // 
            return res.status(200).send(rssfeed_all);
        });    });
}

function rssfeed_spacenews(){
    feed("http://spacenews.com/feed/", function(err, articles) {
        if (err) return err;
        return (articles);
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
    
function rssfeed_universetoday(req, res){
    feed("https://www.universetoday.com/universetoday.xml", function(err, articles) {
        console.log(err);
        if (err) return err;
        console.log(articles);
        return res.status(200).send(articles);
        });
            
}

//------------------------- Server start listening ----------------------
app.listen(port);
console.log('========= listening on port ' + port + ' =========');

