var express = require('express');
var http = require('http');
var io = require('socket.io');
var exec = require('child_process').exec
var redis = require('redis');
var client = redis.createClient(6379, 'localhost', {no_ready_check: true});
client.auth('password', function (err) {
    if (err) throw err;
});
var state = {};
client.on('connect', function() {
    console.log('Connected to Redis');
    client.get("state",function(err,data){
		if(!data){
			console.log("Could not get data from Redis")
		}else{
			var state = JSON.parse( data.toString() );
		}
	});
});

var app = express();
var server = http.createServer(app);
var serv_io = io.listen(server);
server.listen(8080);
app.use(express.static('./bin/'));
function updateState(data){
	state = data;
	state.getColor = function(){
		if(this.groups[this.currentGroup].white){
			return -1;
		}else{
			return this.groups[this.currentGroup].color;
		}
	}
	state.getBrightness = function(){
		var group = this.groups[this.currentGroup]
		if(group.white){
			return group.whiteBrightness;
		}else{
			return group.colorBrightness;
		}
	}
	state.isOn = function(){
		return this.groups[this.currentGroup].on;
	}
	state.isWhite = function(){
		return this.groups[this.currentGroup].white;
	}
	client.set("state",JSON.stringify(state));
}
serv_io.sockets.on('connection',function(socket){
	// socket.emit('update',state)
	socket.on('group',function(data){
		updateState(data);
		exec("python /home/pi/Milight/wrapper.py " + state.currentGroup + " ON");
	});
	socket.on('white',function(data){
		updateState(data);
		if(state.isWhite()){
			exec("python /home/pi/Milight/wrapper.py " + state.currentGroup + " ON -w");
		}else{
			exec("python /home/pi/Milight/wrapper.py " + state.currentGroup + " ON -c" + state.getColor());
		}
	});
	socket.on('brightness',function(data){
		updateState(data);
		exec("python /home/pi/Milight/wrapper.py " + state.currentGroup + " ON -b " + state.getBrightness());
	});
	socket.on('color',function(data){
		updateState(data);
		exec("python /home/pi/Milight/wrapper.py " + state.currentGroup + " ON -c " + state.getColor());
	});
	socket.on('power',function(data){
		updateState(data);
		if(state.isOn()){
			exec("python /home/pi/Milight/wrapper.py " + state.currentGroup + " ON");
		}else{
			exec("python /home/pi/Milight/wrapper.py " + state.currentGroup + " OFF");
		}

	});
});
