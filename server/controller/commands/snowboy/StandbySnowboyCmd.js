APP.StandbySnowboyCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.RobotModel.islistening = false;
        APP.services.socketController.sendAction('listen_off', 'listen_off');
        setTimeout(function(){
            APP.services.SnowboyService.start();
        }, 1500);
        //_ref.talkController.speech('A bientot');
        APP.services.SoundEmotionService.playSound('sad');
        resolve();
    }


    return this;

});
