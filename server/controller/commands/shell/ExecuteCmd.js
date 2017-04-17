APP.ExecuteCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words){
        APP.DevicesService.execute(powerFullProcess.cmd).then(function(){

            if(powerFullProcess.cmd.indexOf('mocp')){
                _ref.lastServiceLaunch = 'vlc';
            }
            APP.SoundEmotionService.playSound('talk');
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