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

var state = {White:1,currentGroup:0,color:0,colorBrightness:25,whiteBrightness:25,groupState:[true,true,true,true]};



function colorUpdate(data){
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON -c " + data.color);
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON -b " + data.colorBrightness);
    console.log(new Date().toString()+" c change");
}
function whiteUpdate(data){
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON -w");
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON -b " + data.whiteBrightness);
    console.log(new Date().toString()+" b change");
}
function onUpdate(data){
    exec("python /home/pi/Milight/wrapper.py " + data.currentGroup + " ON");
}
function offUpdate(data){
    exec("python /home/pi/Milight/wrapper.py " + state.currentGroup + " OFF");
}

serv_io.sockets.on('connection', function(socket) {

	function stateUpdate(data){
		state = data;
		socket.emit('update-state', state);
		client.set("state",JSON.stringify(state));
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
    	if(state.groupState!=data.groupState){
    		if(data.groupState[data.currentGroup]){
    			onUpdate(data);
    		}else{
    			offUpdate(data);
    		}
    	}
    	stateUpdate(data)
    });
});