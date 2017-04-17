APP.NextSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        _ref.socketController.sendAction('soundcloud_next', 'soundcloud_next');
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
