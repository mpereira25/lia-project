APP.PrevSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_prev', 'soundcloud_prev');
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
