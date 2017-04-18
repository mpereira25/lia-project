APP.BaseModule = (function(){

    var _ref = this;

    this.init = function(homepageServer){

        APP.models.CommandsModel = new APP.CommandsModel();
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

    }


    return this;

});
