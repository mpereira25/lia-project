APP.ResumeMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.resume();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
