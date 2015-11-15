var state = {White:1,currentGroup:0,color:0,colorBrightness:25,whiteBrightness:25,groupState:[true,false,false,false]};
var socket = io.connect();
console.log(state.currentGroup)
function adjustColor(color){
	var ADJ = 30;
	if(color - ADJ < 360){
		return color + (180 + ADJ);
	}else{
		return color - ADJ;
	}
}

function stateUpdate(){
	socket.emit('update-state', state);
}

function refreshColor(em) {
    var h = adjustColor(parseInt($("#color-slider").slider("value") * (360 / 255))),
        s = 50,
        l = parseInt($("#brightness-slider").slider("value") * (50 / 25) + 10);
    if(state.White=1){
    	l=state.colorBrightness;
    	state.White = 0;
    }
    $("body").css("background-color", function() {
        return "hsl(" + h + "," + s + "%," + l + "%)";
    });
    state.colorBrightness = $("#brightness-slider").slider("value");
    state.color = $("#color-slider").slider("value");
    if (em) {
        stateUpdate()
    };

}

function refreshWhite(em) {
    var l = parseInt($("#brightness-slider").slider("value") * (50 / 25) + 10);
    if(!state.White){
    	l =state.whiteBrightness;
    }
    $("body").css("background-color", function() {
        return "hsl(0,0%," + l + "%)";
    });
    state.whiteBrightness = $("#brightness-slider").slider("value");
    state.White = 1
    if(em){
	    stateUpdate()
	}
}
$(function() {
    socket.emit('ready');
    socket.on('Welcome', function(data) {
        if (state.White != data.White) {
            state.White = data.White;
            refreshWhite(false);
        }
        if (state.currentGroup != data.group) {
            state.currentGroup = data.group;
        }
        if (data.currentGroup==0) {
        	$(".groupBtn").removeClass('btn-success').addClass('btn-default')
	        $("#all").removeClass('btn-default').addClass('btn-success')
        }else if (data.currentGroupp<5) {
        	grpname = "#ch"+data.currentGroup;
        	$(".groupBtn").removeClass('btn-success').addClass('btn-default')
	        $(grpname).removeClass('btn-default').addClass('btn-success')
        };
        if (state.color != data.color) {
            state.color = data.color;
            refreshColor(false);
        }
        if (state.colorBrightness != data.colorBrightness) {
            state.colorBrightness = data.colorBrightness;
            refreshColor(false);
        }
        if (state.whiteBrightness != data.whiteBrightness) {
            state.whiteBrightness = data.whiteBrightness;
            refreshWhite(false);
        }
    });
	if(state.White){
		var absBrightness = state.whiteBrightness;
	}else{
		var absBrightness = state.colorBrightness;
	}
    $("#brightness-slider").slider({
        min: 0,
        max: 25,
        value: absBrightness,
        change: function(event, ui) {
        	$("#brightness").val(ui.value);
        	if(event.originalEvent){
	            if (state.White) {
	                refreshWhite(true);
	            } else {
	                refreshColor(true);
	            }
	        }else{
	            if (state.White) {
	                refreshWhite(false);
	            } else {
	                refreshColor(false);
	            }
	        }
        },
        // maybe fun to uncomment if serialport ever works
        slide: function(event, ui) {
            $("#brightness").val(ui.value);
            if(state.White){
            	refreshWhite(false);
            }else{
            	refreshColor(false);
            }
        }
    });
    $("#color-slider").slider({
        min: 0,
        max: 255,
        value: state.color,
        change: function(event, ui) {
        	if(event.originalEvent){
	        	$("#color").val(ui.value);
	            refreshColor(true);
        	}else{
				$("#color").val(ui.value);
	            refreshColor(false);
        	}

        },
        slide: function(event, ui) {
            $("#color").val(ui.value);
            refreshColor(false);
        },
    });
    $("#white").click(function() {
        refreshWhite(true);
    });
    $("#on").click(function() {
        if (state.White) {
            refreshWhite(true);
        } else {
            refreshColor(true);
        }
        state.groupState[state.currentGroup] = true;
        stateUpdate()
    });
    $("#off").click(function() {
        $("body").css("background-color", function() {
            return "hsl(0,0%,0%)";
        });
        state.groupState[state.currentGroup] = false;
        stateUpdate()
    });
    function clicked(evt){
    	grp = evt.data.grp;
    	groups = ["#all","#ch1","#ch2","#ch3","#ch4"]
        $(".groupBtn").removeClass('btn-success').addClass('btn-default')
        $(groups[grp]).removeClass('btn-default').addClass('btn-success')
        state.currentGroup = grp;
        stateUpdate();
    }
    $("#all").click({grp:0},clicked);
    $("#ch1").click({grp:1},clicked);
    $("#ch2").click({grp:2},clicked);
    $("#ch3").click({grp:3},clicked);
    $("#ch4").click({grp:4},clicked);
});
$(window).on('beforeunload', function() {
    socket.close();
});