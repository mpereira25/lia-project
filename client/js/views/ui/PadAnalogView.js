APP.PadAnalogView = function(container, socketController, touchController) {


    // ANALOG
    var percentX = 0; // -1 to 1
    var percentY = 0; // -1 to 1
    var sizeBox = container.height();
    var buttonAnalog = container.find('.buttonAnalog');
    var posDown = {x : 0, y : 0};

    var sendSocket = function(){
        //console.log("percentY " + percentY);

        // send socket
        socketController.motion(APP.SOCKET_MESSAGE.ANALOG, percentX + "," + percentY);
    };

    function onUpAnalog(){

        buttonAnalog.css('top', "");
        buttonAnalog.css('left', "");

        buttonAnalog.addClass("resetPosition");

        percentX = 0;
        percentY = 0;

        touchController.removeEventListener(touchController.MOVE,  onMoveAnalog, container[0]);
        touchController.removeEventListener(touchController.UP,  onUpAnalog, document.body);

        sendSocket();
    }

    function onMoveAnalog(x, y){

        percentX = ((sizeBox/2 + (x-posDown.x)) / sizeBox) - 0.5;
        percentY = ((sizeBox/2 + (y-posDown.y)) / sizeBox) - 0.5;

        var radius = Math.sqrt(Math.pow(Math.abs(percentX), 2) + Math.pow(Math.abs(percentY), 2));

        if(radius > 0.5){
            var angle = Math.atan(percentY/percentX);
            var m = ((percentX < 0) ? -1 : 1);
            percentX = Math.cos(angle) * 0.5 * m;
            percentY = Math.sin(angle) * 0.5 * m;
        }

        buttonAnalog.css('top', (0.5 + percentY)*sizeBox + 'px');
        buttonAnalog.css('left',(0.5 + percentX)*sizeBox + 'px');

        sendSocket();

    }


    var init = function(){
        touchController.addEventListener(touchController.DOWN,  function(x, y){
            console.log("onDOWNAnalog");

            posDown.x = x;
            posDown.y = y;

            buttonAnalog.removeClass("resetPosition");

            touchController.addEventListener(touchController.MOVE,  onMoveAnalog, container[0]);
            touchController.addEventListener(touchController.UP,  onUpAnalog, document.body);

            sendSocket();

        }, container.find('.analog')[0]);


    };

    init();


    return this;
};