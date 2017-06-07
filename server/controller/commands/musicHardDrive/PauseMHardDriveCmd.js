APP.PauseMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.pause();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
