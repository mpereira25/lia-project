APP.NextVlcCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.execute(['mocp -f']).then(function(){
            resolve();
        }).catch(function(){
            resolve();
        });
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
