APP.UpVolumeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.upVolume();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
