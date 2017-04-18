APP.DownVolumeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.downVolume();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
