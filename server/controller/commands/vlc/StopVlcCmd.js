APP.StopVlcCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.execute(['mocp -s']).then(function(){
        });
        APP.services.SoundEmotionService.playSound('talk');
        _ref.lastServiceLaunch = null;
        resolve();
    }


    return this;

});
