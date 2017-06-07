APP.ExecuteCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words, lastServiceLaunch, sound){
        APP.services.DevicesService.execute(powerFullProcess.cmd).then(function(){

            if(powerFullProcess.cmd.indexOf('mocp')){
                _ref.lastServiceLaunch = 'MusicModule';
            }
            if(sound){
                APP.services.SoundEmotionService.playSound('talk');
            }

            if(powerFullProcess.successAnswer){
                //_ref.talkController.speech(powerFullProcess.successAnswer);
            }

            resolve();
        }, function() {
            resolve();
        });
    }


    return this;

});
