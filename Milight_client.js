var state = {White:1,currentGroup:0,color:0,colorBrightness:25,whiteBrightness:25,groupState:[true,true,true,true]};
var socket = io.connect();

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
    $("body").css("background-color", function() {
        return "hsl(0,0%," + l + "%)";
    });
    state.White = 1
    if(em){
	    stateUpdate()
	}
}
$(function() {
    socket.emit('ready');
    socket.on('Welcome', function(data) {
    	console.log(data);
        if (state.White != data.White) {
            state.White = data.White;
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
        }
        if (state.colorBrightness != data.colorBrightness) {
            state.colorBrightness = data.colorBrightness;
        }
        if (state.whiteBrightness != data.whiteBrightness) {
            state.whiteBrightness = data.whiteBrightness;
        }
    });
    $("#brightness-slider").slider({
        min: 0,
        max: 25,
        value: 25,
        change: function(event, ui) {
        	if(event.originalEvent){
	            $("#brightness").val(ui.value);
	            if (state.White) {
	                refreshWhite(true);
	            } else {
	                refreshColor(true);
	            }
	        }else{
	        	$("#brightness").val(ui.value);
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
        value: 0,
        change: function(event, ui) {
        	if(event.originalEvent){
	        	$("#color").val(ui.value);
	            state.White = 0;
	            refreshColor(true);
        	}else{
				$("#color").val(ui.value);
	            state.White = 0;
	            refreshColor(false);
        	}

        },
        // maybe fun to uncomment if serialport ever works
        slide: function(event, ui) {
            $("#color").val(ui.value);
            state.White = 0;
            refreshColor(false);
        },
    });
    $("#white").click(function() {
        state.White = 1;
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
    function clicked(grp){
    	groups = ["#all","#ch1","#ch2","#ch3","#ch4"]
        $(".groupBtn").removeClass('btn-success').addClass('btn-default')
        $(groups[grp]).removeClass('btn-default').addClass('btn-success')
        state.currentGroup = grp;
        stateUpdate();
    }
    $("#all").click(0,clicked);
    $("#ch1").click(1,clicked);
    $("#ch2").click(2,clicked);
    $("#ch3").click(3,clicked);
    $("#ch4").click(4,clicked);
});
$(window).on('beforeunload', function() {
    socket.close();
});