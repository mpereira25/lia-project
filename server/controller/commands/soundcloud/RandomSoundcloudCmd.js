APP.RandomSoundcloudCmd = (function(dispatcherCmds){

    var _dispatcherCmds = dispatcherCmds;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_random', 'soundcloud_random');
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
