APP.PadView = function(container, touchController) {

    var _ref = this;
    _ref.onStop = null;
    _ref.onUp = null;
    _ref.onDown = null;
    _ref.onRight = null;
    _ref.onLeft = null;

    var init = function(){

        $('.left').bind('mouseup',  stopMotion);
        $('.right').bind('mouseup',  stopMotion);
        $('.up').bind('mouseup',  stopMotion);
        $('.down').bind('mouseup',  stopMotion);


        $('.left').bind('touchend',  stopMotion);
        $('.right').bind('touchend',  stopMotion);
        $('.up').bind('touchend',  stopMotion);
        $('.down').bind('touchend',  stopMotion);

        //PAD
        container.find('.left').bind('mousedown',  function(){
            console.log("left");

            if(_ref.onLeft){
                _ref.onLeft();
            }
            $('body').bind('mouseup',  stopMotion);

        });

        container.find('.left').bind('touchstart',  function(){
            if(_ref.onLeft){
                _ref.onLeft();
            }
            $('body').bind('touchend',  stopMotion);
        });

        container.find('.right').bind('mousedown',  function(x, y){
            console.log("right");
            if(_ref.onRight){
                _ref.onRight();
            }
            $('body').bind('mouseup',  stopMotion);

        });

        container.find('.right').bind('touchstart',  function(){
            if(_ref.onRight){
                _ref.onRight();
            }
            $('body').bind('touchend',  stopMotion);
        });

        container.find('.up').bind('mousedown',  function(x, y){
            if(_ref.onUp){
                _ref.onUp();
            }
            $('body').bind('mouseup',  stopMotion);

        });
        container.find('.up').bind('touchstart',  function(){
            if(_ref.onUp){
                _ref.onUp();
            }
            $('body').bind('touchend',  stopMotion);
        });

        container.find('.down').bind('mousedown',  function(x, y){
            if(_ref.onDown){
                _ref.onDown();
            }
            $('body').bind('mouseup',  stopMotion);

        });
        container.find('.down').bind('touchstart',  function(){
            if(_ref.onDown){
                _ref.onDown();
            }
            $('body').bind('touchend',  stopMotion);
        });

    };


    var stopMotion = function(){
        if(_ref.onStop){
            _ref.onStop();
        }
        $('body').unbind('mouseup', stopMotion);
        $('body').unbind('touchend', stopMotion);
    };

    init();

    return this;
};