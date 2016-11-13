"use strict";

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require ('bcrypt');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');

app.set('view engine','pug');
app.set('views','./views');
app.locals.pretty = true; //output pretty html

app.use(express.static(__dirname + '/public')); 
app.use(bodyParser.urlencoded({extended:true})); 
app.use(cookieParser()); 
app.use(favicon(__dirname + '/public/images/favicon.ico')); 

var db;

MongoClient.connect('mongodb://dbu:password@ds151127.mlab.com:51127/dbname',function(err,database){
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
            res.cookie('id',rand,{maxAge:900000000000,httpOnly:true});

            var user = {referral:req.body.referral,email:req.body.email,pass:hash,cookie:rand,points:0,novice:1};

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
            var data = {refError:false,usrError:false};
            if(req.query['err']=='ref')
                data.refError = true;
            if(req.query['err']=='usr')
                data.usrError = true;
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
            var userEmail = result[0].email;
            var userPoints = result[0].points;
            var novice;
            if(result[0].novice==1)
                novice = true;
            else
                novice = false;
            var data = {email:userEmail,points:userPoints,showInfo:novice};
        	res.render('members',data);
        }
        else{
            res.redirect('/');
        }
    });
});

app.post('/login',function(req,res){
    var providedEmail = req.body.email;
    var providedPass = req.body.pass;


    //check user and pass
    db.collection('users').find({email:providedEmail}).toArray(function(err,result){
        if(err)
            throw err;
        if(result.length){
            var hash = result[0].pass;
            if(bcrypt.compareSync(providedPass,hash)){
                var rand = randomString();
                res.cookie('id',rand,{maxAge:900000000000,httpOnly:true});
                
                db.collection('users').update({email:providedEmail},{$set:{cookie:rand}},function(err,result){
                    if(err)
                        throw err;
                    res.redirect('/members/');
                });
            }
            else{
                res.redirect('/?err=usr');
            }    
        }
        else{
            res.redirect('/?err=usr');
        }
    });    
});


app.get('/logout',function(req,res){
    //remove cookie from db
    var cookieId = req.cookies.id;
    db.collection('users').update({cookie:cookieId},{$set:{cookie:''}},function(err,updated){
        if(err)
            throw err;
    });
    //remove cookie from browser
    res.clearCookie('id');
    res.redirect('/');
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

    return string1+string2+string3;
}
