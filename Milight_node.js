var express = require('express');
var http = require('http');
var io = require('socket.io');
var exec = require('child_process').exec
var redis = require('redis');
var client = redis.createClient(6379, 'localhost', {no_ready_check: true});
client.auth('password', function (err) {
    if (err) throw err;
});

var state = {White:1,currentGroup:0,color:0,colorBrightness:25,whiteBrightness:25,groupState:[true,false,false,false]};

client.on('connect', function() {
    console.log('Connected to Redis');
    client.get("state",function(err,data){
		if(!data){
			console.log("could not get data from redis")
		}else{
			state = JSON.parse( data.toString() );
		}
	});
});

    // var SerialPort = require("serialport").SerialPort
    // var serialPort = new SerialPort("/dev/ttyAMA0", {
    //   baudrate: 9600
    // });
var app = express();
var server = http.createServer(app);
var serv_io = io.listen(server);
server.listen(8080);
app.use(express.static('.'))




function colorUpdate(data){
	console.log("cu")
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON -c " + data.color);
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON -b " + data.colorBrightness);
}
function whiteUpdate(data){
	console.log("wu")
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON -w");
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON -b " + data.whiteBrightness);
}
function onUpdate(data){
	console.log("onu")
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON");
}
function offUpdate(data){
	console.log("offu")
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " OFF");
}

serv_io.sockets.on('connection', function(socket) {

	function stateUpdate(data){
		state = data;
		socket.emit('update-state', state);
		client.set("state",JSON.stringify(state));
		console.log(state, data);
	}

    socket.on('ready', function() {
    	client.get("state",function(err,data){
    		if(!data){

    		}else{
    			state = JSON.parse( data.toString() );
    		}
    	});
        socket.emit('Welcome', state);
    });

    socket.on('update-state',function(data){
    	if(state.White != data.White){
    		whiteUpdate(data);
    	}
    	if(state.color != data.color){
    		colorUpdate(data);
    	}
    	if(state.groupState != data.groupState){
    		state.groupState = data.groupState;
    	}
    	if(state.currentGroup!=data.currentGroup){
    		state.currentGroup = data.currentGroup;
    	}
    	stateUpdate(data)
    });
});