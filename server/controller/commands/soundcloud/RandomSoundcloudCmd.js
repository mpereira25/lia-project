APP.RandomSoundcloudCmd = (function(dispatcherCmds){

    var _dispatcherCmds = dispatcherCmds;

    this.execute = function(resolve){
        _dispatcherCmds.socketController.sendAction('soundcloud_random', 'soundcloud_random');
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
