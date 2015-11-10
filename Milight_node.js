var express = require('express');
var http = require('http');
var io = require('socket.io');
var exec = require('child_process').exec
// var SerialPort = require("serialport").SerialPort
// var serialPort = new SerialPort("/dev/ttyAMA0", {
//   baudrate: 9600
// });
var app = express();
var server = http.createServer(app);
var serv_io = io.listen(server);
server.listen(8080);
app.use(express.static('.'))

var brightness = 0, //static variables to hold the current values
 	color = 0,
 	white = 1,
 	group = 0,
 	colorBrightness = 25,
 	whiteBrightness = 20;

serv_io.sockets.on('connection', function (socket) {
	socket.on('ready',function(){
		socket.emit('Welcome',{color:color,white:white,group:group,colorBrightness:colorBrightness,whiteBrightness:whiteBrightness})
	})

	socket.on('Color', function (data) { //makes the socket react to 'led' packets by calling this function
		color = data.color;
		white = 0;
		exec("python /home/pi/Milight/wrapper.py "+group+" ON -c "+color);
		exec("python /home/pi/Milight/wrapper.py "+group+" ON -b "+data.brightness);
		serv_io.sockets.emit('Color',{
	    	color:data.color,
	    	brightness:data.brightness
	    }); //sends the updated values to all connected clients
	});
	socket.on('White',function (data){
		white = 1;
		exec("python /home/pi/Milight/wrapper.py "+group+" ON -w");
		exec("python /home/pi/Milight/wrapper.py "+group+" ON -b "+data.brightness);
		serv_io.sockets.emit('White',{
	    	brightness:data.brightness
	    });
	});
	socket.on('On',function (data){
		// var buf = new Buffer(3); //creates a new 3-byte buffer
		// buf.writeUInt8(String.fromCharCode(71,0,85), 0); //TODO: make a js object for the limitlessled API
		// serialPort.write(buf); //writes the buffer to serial
		exec("python /home/pi/Milight/wrapper.py "+group+" ON");
	});
	socket.on('Off',function (data){
		exec("python /home/pi/Milight/wrapper.py "+group+" OFF");
	});
	socket.on('group',function (data){
		group = data.group;
	});
});