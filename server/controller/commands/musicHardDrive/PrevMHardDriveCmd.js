APP.PrevMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.MusicService.prev();
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
