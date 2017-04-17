APP.PrevSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        _ref.socketController.sendAction('soundcloud_prev', 'soundcloud_prev');
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
