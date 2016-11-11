"use strict";

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

app.set('view engine','pug');
app.set('views','./views');
app.locals.pretty = true;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

var db;

MongoClient.connect('mongodb://mnodeu:lkajf33@ds151127.mlab.com:51127/mnode',function(err,database){
    if(err)
        throw err;
    db = database;    
});

app.post('/signup',function(req,res){
	console.log('---> user signup');
	db.collection('users').save(req.body,function(err,result){
        if(err)
            throw err;
        console.log('---> saved to db');
        res.redirect('/members/');
    });
});

app.get('/',function(req,res) {
	res.render('index');
});

app.get('/members',function(req,res){
	res.render('members');
});

app.get('*',function(req,res){
	res.status(404);
	res.render('404');
});

app.listen(process.env.PORT || 3000,function(){
	console.log('App Listening on port 3000');
});
