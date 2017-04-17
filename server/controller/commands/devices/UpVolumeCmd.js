APP.UpVolumeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.DevicesService.upVolume();
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
