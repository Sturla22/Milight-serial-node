var express = require('express');
var http = require('http');
var io = require('socket.io');
var exec = require('child_process').exec
var redis = require('redis');
var client = redis.createClient(6379, 'localhost', {no_ready_check: true});
client.auth('password', function (err) {
    if (err) throw err;
});

client.on('connect', function() {
    console.log('Connected to Redis');
    client.get("state",function(err,data){
		if(!data){
			console.log("Could not get data from Redis")
		}else{
			state = JSON.parse( data.toString() );
		}
	});
});

var app = express();
var server = http.createServer(app);
var serv_io = io.listen(server);
server.listen(8080);
app.use(express.static('.'))