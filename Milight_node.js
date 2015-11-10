var express = require('express');
var http = require('http');
var io = require('socket.io');
var app = express();
var server = http.createServer(app);
var serv_io = io.listen(server);
server.listen(8080);
app.use(express.static('.'))

var brightness = 0, //static variables to hold the current values
 	color = 0,
 	white = 1;

serv_io.sockets.on('connection', function (socket) {
	socket.on('Color', function (data) { //makes the socket react to 'led' packets by calling this function
		console.log(data.color+" "+data.brightness);
		// brightness = data.value;  //updates brightness from the data object
		// var buf = new Buffer(1); //creates a new 1-byte buffer
		// buf.writeUInt8(brightness, 0); //writes the pwm value to the buffer
		// serialPort.write(buf); //transmits the buffer to the arduino
		serv_io.sockets.emit('Color',{
	    	color:data.color,
	    	brightness:data.brightness
	    }); //sends the updated values to all connected clients
	});
	socket.on('White',function (data){
		console.log("White: "+data.brightness);
		serv_io.sockets.emit('White',{
	    	brightness:data.brightness
	    });
	});
	socket.on('On',function (data){
		console.log("On");
	});
	socket.on('Off',function (data){
		console.log("Off");
	});
});