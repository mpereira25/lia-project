APP.DownVolumeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.DevicesService.downVolume();
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
