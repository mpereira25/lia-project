APP.RandomMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        _ref.socketController.sendAction('soundcloud_random', 'soundcloud_random');
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
