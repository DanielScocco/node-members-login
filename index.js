"use strict";

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require ('bcrypt');
var cookieParser = require('cookie-parser');

app.set('view engine','pug');
app.set('views','./views');
app.locals.pretty = true;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

var db;

MongoClient.connect('mongodb://mnodeu:lkajf33@ds151127.mlab.com:51127/mnode',function(err,database){
    if(err)
        throw err;
    db = database;    
});

app.post('/signup',function(req,res){
    //check if referral is valid
    var ref = req.body.referral;
    db.collection('users').find({email:ref}).toArray(function(err,result){
        //referral is valid, signup user
        if(result.length){
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(req.body.pass,salt);

            //set cookie on browser and db
            var rand = randomString();
            res.cookie('id',rand,{maxAge:900000000000,httpOnly:true,secure:true});

            var user = {referral:req.body.referral,email:req.body.email,pass:hash,cookie:rand,points:0};

            db.collection('users').save(user,function(err,result){
                if(err)
                    throw err;
                console.log('---> New user signup');
                res.redirect('/members/');
            });
        } 
        //referral invalid
        else{
            res.redirect('/?err=ref');
        }
    });
});

app.get('/',function(req,res) {
    //check if logged, if so redirect, else return index.html
    var cookieId = req.cookies.id;
    db.collection('users').find({cookie:cookieId}).toArray(function(err,result){
        if(err)
            throw err;
        if(result.length){
            res.redirect('/members/');
        }
        //not logged, display index.html
        else{
            var data;
            if(req.query['err']=='ref')
                data = {refError:true};
            else
                data = {refError:false};
	        res.render('index',data);
       }
    });
});

app.get('/members',function(req,res){
    //check if logged, else redirect
    var cookieId = req.cookies.id;
    db.collection('users').find({cookie:cookieId}).toArray(function(err,result){
        if(err)
            throw err;
        if(result.length){
            var userEmail = result.email;
            var userPoints = result.point;
            data = {email=userEmail,points=userPoints};
        	res.render('members',data);
        }
        else{
            res.redirect('/');
        }
});

app.get('*',function(req,res){
	res.status(404);
	res.render('404');
});

app.listen(process.env.PORT || 3000,function(){
        console.log('App Listening on port 3000');
});

//returns a random 30-char string
function randomString(){
    var d = new Date();
    var string1 = ""+d.getTime();
    string1 = string1.substring(0,10);

    var string2 = "";
    for(var i=0;i<10;i++){
        string2 += Math.floor(Math.random() * 20);
    }
    string2 = string2.substring(0,10);


    var string3 = "";
    var n = d.getMilliseconds();
    for(var i=0;i<10;i++){
        var random = Math.floor(Math.random()*10);
        var n = d.getMilliseconds();
        string3 += (random * n)
    }

    string3 = string3.substring(0,10);

    return string1++string2+string3;
}
