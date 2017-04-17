APP.StopMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.MusicService.stop();
        APP.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
