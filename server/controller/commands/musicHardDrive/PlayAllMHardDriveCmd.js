APP.PlayAllMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        _ref.lastServiceLaunch = 'MusicModule';
        APP.services.MusicService.playAll();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
