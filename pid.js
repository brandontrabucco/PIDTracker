$(document).ready(function () {
    $('body').height($(window).height());

    var mouse = { x: $(window).width() / 2, y: $(window).height() / 2, log: { x: { past: 0, current: 0 }, y: { past: 0, current: 0 } } }, box = { x: 0, y: 0 },
    $d = $('#pid-draggable'), setpoint = { x: 0, y: 0 }, offset = { x: 0, y: 0 }, currentError = { x: 0, y: 0 }, currentInput = { x: 0, y: 0 },
    pastError = { x: 0, y: 0 }, pastInput = { x: 0, y: 0 }, direction = { x: 0, y: 0 }, area = { x: 0, y: 0 }, correction = { x: 0, y: 0 },
    distance = { x: 0, y: 0 }, rate = { x: 0, y: 0 }, isRunning = false, trackMouse,

    errorHandler = { x: [0, 0, 0, 0], y: [0, 0, 0, 0] }, errorDelta = { x: 0, y: 0 },
    distHandler = { x: [0, 0, 0, 0], y: [0, 0, 0, 0] }, distDelta = { x: 0, y: 0 };

    box.x = $d.css('left');
    box.y = $d.css('top');

    var boxLog = { x: parseInt(box.x), y: parseInt(box.y) };
    var KP = .6, KI = .4, KD = .0095; // .6, .4, .0095 are the optimum values
    var $kp = $('#pid-kp input'), $ki = $('#pid-ki input'), $kd = $('#pid-kd input');

    var activekey, pastactive;
    var keydata = [];
    var keydisplay = [];

    boxLog = { x: parseInt(box.x), y: parseInt(box.y) };

    mouse.log.x.past = mouse.log.x.current;
    mouse.log.y.past = mouse.log.y.current;

    pastError.x = currentError.x;
    pastError.y = currentError.y;
    mouse.log.x.current = parseInt(mouse.x);
    mouse.log.y.current = parseInt(mouse.y);
    currentInput.x = parseInt(box.x);
    currentInput.y = parseInt(box.y);

    currentError.x = currentInput.x - parseInt(mouse.x);
    currentError.y = currentInput.y - parseInt(mouse.y);

    errorHandler.x.splice(3, 1);
    errorHandler.y.splice(3, 1);
    errorHandler.x.unshift(currentError.x);
    errorHandler.y.unshift(currentError.y);

    errorDelta.x = (4 * errorHandler.x[0] + 3 * errorHandler.x[1] + 2 * errorHandler.x[2] + 1 * errorHandler.x[3]) / 10;
    errorDelta.y = (4 * errorHandler.y[0] + 3 * errorHandler.y[1] + 2 * errorHandler.y[2] + 1 * errorHandler.y[3]) / 10;

    $('#pid-error-x').html(errorDelta.x);
    $('#pid-error-y').html(errorDelta.y);

    document.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX || e.pageX;
        mouse.y = e.clientY || e.pageY;
    }, false);

    function getPID() {
        if (isRunning == false) {
            KP = parseFloat($('#pid-kp input').val());
            KI = parseFloat($('#pid-ki input').val());
            KD = parseFloat($('#pid-kd input').val());

            $('#pid-val-p').html(KP);
            $('#pid-val-i').html(KI);
            $('#pid-val-d').html(KD);

            
            $('#pid-peak #pid-peak-x').html(0);
            $('#pid-peak #pid-peak-y').html(0);
        }

        else if (isRunning == true) {
            distance.x = mouse.log.x.past - mouse.log.x.current;
            distance.y = mouse.log.y.past - mouse.log.y.current;

            distHandler.x.splice(3, 1);
            distHandler.y.splice(3, 1);
            distHandler.x.unshift(mouse.x);
            distHandler.y.unshift(mouse.y);

            distDelta.x = -(1 * distHandler.x[0] + 3 * distHandler.x[1] - 3 * distHandler.x[2] - 1 * distHandler.x[3]) / 6;
            distDelta.y = -(1 * distHandler.y[0] + 3 * distHandler.y[1] - 3 * distHandler.y[2] - 1 * distHandler.y[3]) / 6;

            rate.x = distDelta.x / .01;
            rate.y = distDelta.y / .01;

            area.x = area.x + errorDelta.x * .01;
            area.y = area.y + errorDelta.y * .01;
            direction.x = errorDelta.x / Math.abs(errorDelta.x);
            direction.y = errorDelta.y / Math.abs(errorDelta.y);

            correction.x = (direction.x * (Math.sqrt(Math.abs(errorDelta.x))) * KP) + (area.x * KI) + (rate.x * KD);
            correction.y = (direction.y * (Math.sqrt(Math.abs(errorDelta.y))) * KP) + (area.y * KI) + (rate.y * KD);

            $d.css({
                'left': boxLog.x - correction.x,
                'top': boxLog.y - correction.y
            });

            box.x = $d.css('left');
            box.y = $d.css('top');

            boxLog = { x: parseInt(box.x), y: parseInt(box.y) };

            mouse.log.x.past = mouse.log.x.current;
            mouse.log.y.past = mouse.log.y.current;
            pastError.x = currentError.x;
            pastError.y = currentError.y;
            mouse.log.x.current = parseInt(mouse.x);
            mouse.log.y.current = parseInt(mouse.y);
            currentInput.x = parseInt(box.x);
            currentInput.y = parseInt(box.y);

            currentError.x = currentInput.x - parseInt(mouse.x);
            currentError.y = currentInput.y - parseInt(mouse.y);

            if (currentError.x > parseFloat($('#pid-peak #pid-peak-x').html())) {
                $('#pid-peak #pid-peak-x').html(currentError.x);
            }

            if (currentError.y > parseFloat($('#pid-peak #pid-peak-y').html())) {
                $('#pid-peak #pid-peak-y').html(currentError.y);
            }

            errorHandler.x.splice(3, 1);
            errorHandler.y.splice(3, 1);
            errorHandler.x.unshift(currentError.x);
            errorHandler.y.unshift(currentError.y);

            errorDelta.x = (4 * errorHandler.x[0] + 3 * errorHandler.x[1] + 2 * errorHandler.x[2] + 1 * errorHandler.x[3]) / 10;
            errorDelta.y = (4 * errorHandler.y[0] + 3 * errorHandler.y[1] + 2 * errorHandler.y[2] + 1 * errorHandler.y[3]) / 10;

            $('#pid-error-x').html(errorDelta.x);
            $('#pid-error-y').html(errorDelta.y);
        }
    }

    trackMouse = setInterval(getPID, 10);

    $(document.body).keydown(function (e) {
        activekey = e.keyCode;
        if ($.inArray(activekey, keydata) == -1) keydata.push(activekey);
        pastactive = activekey;

        if ($.inArray(32, keydata) != -1) {
            $('#pid-toggle').stop();
            keydata = [];
            pastactive = 0;
            if (isRunning == true) {
                isRunning = false;
                $('#pid-toggle').html('Paused');
                $('#pid-peak #peak-x').html(0);
                $('#pid-peak #peak-y').html(0);
                $('#pid-toggle').css({
                    'opacity': '1'
                });
                $('#pid-toggle').animate({
                    'opacity': '0'
                }, 1000);
            }
            else if (isRunning == false) {
                isRunning = true;
                $('#pid-toggle').html('Running');
                $('#pid-toggle').css({
                    'opacity': '1'
                });
                $('#pid-toggle').animate({
                    'opacity': '0'
                }, 1000);
            }
        }
    });

    $(document.body).keyup(function (e) {
        keydata = [];
        pastactive = 0;
    });
});
