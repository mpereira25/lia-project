var fs = require('fs');

APP.BaseModule = (function(){

    var _ref = this;

    var intervalClient = -1;
    var countIntervalLimit = 6*60; // 1 hour
    var currentCountInterval = 0;

    this.init = function(homepageServer){

        APP.lastServiceLaunch = null;

        APP.models.CommandsModel = new APP.CommandsModel();
        APP.models.CommandsModel.LISTENING_WORDS_ACTION = APP.commandsJSON;

        APP.models.TalkModel = new APP.TalkModel();

        APP.services.SoundEmotionService = new APP.SoundEmotionService();
        APP.services.DevicesService = new APP.DevicesService();
        APP.services.BddDAO = new APP.BddMongoDAO();

        // Controller Socket
        APP.services.socketController = new APP.SocketController(homepageServer);

        // Controller Interactions Person
        APP.services.talkServeCtrl = new APP.TalkServeCtrl();

        APP.services.SnowboyService = new APP.SnowboyService();
        APP.services.DispatcherCommands = new APP.DispatcherCommands();


        APP.services.DevicesService.startClient();

        intervalClient = setInterval(function(){
            currentCountInterval++;
            if(currentCountInterval >= countIntervalLimit) {
                APP.services.DevicesService.restartClient();
                currentCountInterval = 0;
            }
        }, 10000);
    }


    return this;

});
