APP.NoShuffleMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.noshuffle();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
