"use strict";

var express = require('express');
var app = express(); 
var pg = require('pg');

app.use(express.static(__dirname + '/public'));
pg.defaults.ssl = true;

app.get('/',function(req,res) {
	res.sendFile(__dirname + "/public/index.html");
});

app.listen(process.env.PORT || 3000,function(){
	console.log('App Listening on port 3000');
});
