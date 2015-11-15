var Group = function(on,color,white,whiteBrightness,colorBrightness){
	this.on = on;
	this.color = color;
	this.white = white;
	this.whiteBrightness = whiteBrightness;
	this.colorBrightness = colorBrightness;

	this.update = function(on,color,white,whiteBrightness,colorBrightness,callback){
		if (this.on != on) {
			this.on = on;
		};
		if (this.color != color) {
			this.color = color;
		};
		if (this.white != white) {
			this.white = white;
		};
		if (this.whiteBrightness != whiteBrightness) {
			this.whiteBrightness = whiteBrightness;
		};
		if (this.colorBrightness != colorBrightness) {
			this.colorBrightness = colorBrightness;
		};
	}
	this.toString = function(){
		return "On: " + this.on + ", Color: " + this.color + ", White: "+this.white+", White Brightness: "+this.whiteBrightness+", Color Brightness: "+this.colorBrightness;
	}
	this.getBrightness = function(){
		if(this.white){
			return this.whiteBrightness;
		}else{
			return this.colorBrightness;
		}
	}
	this.setBrightness = function(brightness){
		if(this.white){
			this.whiteBrightness = brightness;
		}else{
			this.colorBrightness = brightness;
		}
	}
}

var state = function(){
	this.groups = [new Group(1,0,1,25,25),
				   new Group(1,0,1,25,25),
				   new Group(1,0,1,25,25),
				   new Group(1,0,1,25,25),
				   new Group(1,0,1,25,25)]
	this.currentGroup = 0;
	this.update = function(grp,on,color,white,whiteBrightness,colorBrightness){
		this.groups[grp].update(on,color,white,whiteBrightness,colorBrightness)
	}
	this.getColor = function(){
		if(this.groups[this.currentGroup].white){
			return -1;
		}else{
			return this.groups[this.currentGroup].color;
		}
	}
	this.getBrightness = function(){
		return this.groups[this.currentGroup].getBrightness();
	}
	this.isWhite = function(){
		return this.groups[this.currentGroup].white;
	}
	this.isOn = function(){
		return this.groups[this.currentGroup].on;
	}
	this.toggleWhite = function(){
		if(this.isWhite()){this.groups[this.currentGroup].white = 0}
		else{this.groups[this.currentGroup].white = 1};
	}
	this.togglePower = function(){
		if(this.isOn()){this.groups[this.currentGroup].on = 0}
		else{this.groups[this.currentGroup].on = 1};
	}
	this.setColor = function(color){
		this.groups[this.currentGroup].color = color;
	}
	this.setBrightness = function(brightness){
		this.groups[this.currentGroup].setBrightness(brightness);
	}
}