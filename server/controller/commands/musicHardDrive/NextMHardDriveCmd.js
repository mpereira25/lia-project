APP.NextMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.MusicService.next();
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
