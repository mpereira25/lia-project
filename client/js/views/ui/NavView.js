APP.NavView = function(container){

    var _ref = this;
    _ref.onStartHead = null;
    _ref.onClickTalk = null;
    _ref.onClickWrite = null;
    _ref.onClickListen = null;
    _ref.onClickHalt = null;

    var talkButton = container.find('.talkButton');
    var listenButton = container.find('.listenButton');
    var writeButton = container.find('.writeButton');
    var headButton = container.find('.headButton');
    var haltButton = container.find('.haltButton');
    var controlDiv = $('.controlDiv');
    var headDiv = $('.headDiv');

    var currentView = "analog";

    headDiv.css("display", "none");

    listenButton.on('click', function(){
        if(_ref.onClickListen){
            _ref.onClickListen();
        }

    });
    haltButton.on('click', function(){
        if(_ref.onClickHalt){
            _ref.onClickHalt();
        }

    });
    talkButton.on('click', function(){
        if(_ref.onClickTalk){
            _ref.onClickTalk();
        }

    });
    writeButton.on('click', function(){
        if(_ref.onClickWrite){
            _ref.onClickWrite();
        }

    });
    headButton.on('click', function(){
        currentView = "head";
        switch(currentView){
            case "analog":
                headDiv.css("display", "none");
                controlDiv.css("display", "block");
                container.css("display", "block");
                break;
            case "head":
                headDiv.css("display", "block");
                controlDiv.css("display", "none");
                container.css("display", "none");
                if(_ref.onStartHead){
                    _ref.onStartHead();
                }
                break;
        }

    });

    this.listen = function(flag){
        if(flag){
            listenButton.addClass('selected');
        }else{
            listenButton.removeClass('selected');
        }
    };

    return this;

};