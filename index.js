"use strict";

var express = require('express');
var app = express(); 

app.set('view engine','pug');
app.set('views','./views');
app.locals.pretty = true;

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res) {
    var data = {title:'hello my friend',message:'sup everyone'};
	res.render('index',data);
});

app.listen(process.env.PORT || 3000,function(){
	console.log('App Listening on port 3000');
});
