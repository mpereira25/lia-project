APP.StopSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        _ref.socketController.sendAction('soundcloud_stop', 'soundcloud_stop');
        APP.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
