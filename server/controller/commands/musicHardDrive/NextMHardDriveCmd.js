APP.NextMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.next();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
