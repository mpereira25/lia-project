APP.StopVlcCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.DevicesService.execute(['mocp -s']).then(function(){
        });
        APP.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
