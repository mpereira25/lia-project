APP.NextSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_next', 'soundcloud_next');
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
