var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var io = require('socket.io');
var exec = require('child_process').exec
var redis = require('redis');
var client = redis.createClient(6379, 'localhost', {no_ready_check: true});
client.auth('password', function (err) {
    if (err) throw err;
});
var Group = function(on,color,white,whiteBrightness,colorBrightness){
	this.on = on;
	this.color = color;
	this.white = white;
	this.whiteBrightness = whiteBrightness;
	this.colorBrightness = colorBrightness;
}

var State = function(){
	this.groups = [
		new Group(1,0,1,25,25),
		new Group(1,0,1,25,25),
		new Group(1,0,1,25,25),
		new Group(1,0,1,25,25),
		new Group(1,0,1,25,25)
	]
	this.currentGroup = 0;
	this.getColor = function(){
		if(this.groups[this.currentGroup].white){
			return -1;
		}else{
			return this.groups[this.currentGroup].color;
		}
	}
	this.getBrightness = function(){
		var group = this.groups[this.currentGroup]
		if(group.white){
			return group.whiteBrightness;
		}else{
			return group.colorBrightness;
		}
	}
	this.isOn = function(){
		return this.groups[this.currentGroup].on;
	}
	this.isWhite = function(){
		return this.groups[this.currentGroup].white;
	}
}
var state = new State();

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
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+'/bin/'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var server = http.createServer(app);
var serv_io = io.listen(server);
server.listen(8080);
app.post('/:group',function(req,res){
	var p = req.body;
	console.log(p);
	for(key in p){
		state.groups[req.params.group][key] = p[key]
	}
	updateState(state);
	if(p.on){
		exec("python /home/pi/Milight/wrapper.py " + req.params.group + " ON")
		if(p.white){
			exec("python /home/pi/Milight/wrapper.py " + req.params.group + " ON -w");
		}else{
			exec("python /home/pi/Milight/wrapper.py " + req.params.group + " ON -c" + p.color);
		}
		exec("python /home/pi/Milight/wrapper.py " + req.params.group + " ON -b " + p.brightness);
	}else{
		exec("python /home/pi/Milight/wrapper.py " + req.params.group + " OFF")
	}
	res.json(state);
});
app.get('/:group',function(req,res){
	var g = state.groups[req.params.group];
	var obj = {data:g};
	res.json(obj)
})

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
	socket.emit('update',JSON.stringify(state));
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
