APP.StopMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.stop();
        APP.services.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
