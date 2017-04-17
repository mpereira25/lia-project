APP.StandbySnowboyCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.RobotModel.islistening = false;
        _ref.socketController.sendAction('listen_off', 'listen_off');
        setTimeout(function(){
            APP.services.SnowboyService.start();
        }, 1500);
        //_ref.talkController.speech('A bientot');
        APP.SoundEmotionService.playSound('sad');
        resolve();
    }


    return this;

});
