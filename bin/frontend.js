var state = new state();
var socket = io.connect();


$(function() {
    function adjustColor(color) {
        var ADJ = 30;
        if (color - ADJ < 360) {
            return color + (180 + ADJ);
        } else {
            return color - ADJ;
        }
    }

    function refreshContent() {
        $("body").css("background-color", function() {
            var s = 50;
            if (state.isWhite()) {
                s = 0;
            }
            var h = adjustColor(parseInt(state.getColor() * (360 / 255)));
            var l = 5;
            if (state.isOn()) {
                l = state.getBrightness() * (50 / 25) + 10;
            } else {
                s = 0;
            }
            return "hsl(" + -h + "," + s + "%," + l + "%)";
        });
        $("#info").html(state.groups[state.currentGroup].toString());
    }

    function btnClick(button) {
        $("#b" + button).click(function() {
            state.currentGroup = button;
            refreshContent();
            $(".groupBtn").removeClass('btn-success').addClass('btn-default');
            $("#b" + button).removeClass('btn-default').addClass('btn-success');
            if (state.isWhite()) {
                $("#white").removeClass('btn-default').addClass('btn-success');
            } else {
                $("#white").removeClass('btn-success').addClass('btn-default');
            }
            if (state.isOn()) {
                $("#pwr").removeClass('btn-default').addClass('btn-success');
            } else {
                $("#pwr").removeClass('btn-success').addClass('btn-default');
            }
            $("#color").slider("value", state.getColor());
            $("#brightness").slider("value", state.getBrightness());
            // send serial command and update db
            socket.emit('group', state);
        });
    }
    for (var i = 0; i < 5; i++) {
        btnClick(i);
    };

    $("#white").click(function() {
        $(this).toggleClass('btn-default').toggleClass('btn-success')
        state.toggleWhite();
        refreshContent();
        $("#brightness").slider("value", state.getBrightness());
        // send serial command and update db
        socket.emit('white', state);
    });
    $("#pwr").click(function() {
        $(this).toggleClass('btn-default').toggleClass('btn-success')
        state.togglePower();
        refreshContent();
        // send serial command and update db
        socket.emit('power', state);
    });

    $("#brightness").slider({
        min: 0,
        max: 25,
        change: function(evt, ui) {
            if (evt.originalEvent) {
                state.setBrightness(ui.value);
                refreshContent();
                // send serial command and update db
                socket.emit('brightness', state);
            }
        },
        slide: function(evt, ui) {
            if (evt.originalEvent) {
                state.setBrightness(ui.value);
                refreshContent();
            }
        }
    });
    $("#color").slider({
        min: 0,
        max: 255,
        change: function(evt, ui) {
            if (evt.originalEvent) {
                state.setColor(ui.value);
                refreshContent();
                // send serial command and update db
                socket.emit('color', state);
            }
        },
        slide: function(evt, ui) {
            if (evt.originalEvent) {
                state.setColor(ui.value);
                refreshContent();
            }
        }
    });
    socket.on('update', function(data) {
        state = data;
        $(".groupBtn").removeClass('btn-success').addClass('btn-default');
        $("#b" + state.currentGroup).removeClass('btn-default').addClass('btn-success');
        if (state.isWhite()) {
            $("#white").removeClass('btn-default').addClass('btn-success');
        } else {
            $("#white").removeClass('btn-success').addClass('btn-default');
        }
        if (state.isOn()) {
            $("#pwr").removeClass('btn-default').addClass('btn-success');
        } else {
            $("#pwr").removeClass('btn-success').addClass('btn-default');
        }
        $("#color").slider("value", state.getColor());
        $("#brightness").slider("value", state.getBrightness());
    });
});
$(window).on('beforeunload', function() {
    socket.close();
});