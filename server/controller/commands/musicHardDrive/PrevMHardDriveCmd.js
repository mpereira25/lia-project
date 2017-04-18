APP.PrevMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.prev();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
