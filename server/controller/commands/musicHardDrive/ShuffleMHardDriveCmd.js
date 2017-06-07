APP.ShuffleMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.shuffle();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
