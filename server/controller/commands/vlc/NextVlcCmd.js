APP.NextVlcCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.DevicesService.execute(['mocp -f']).then(function(){
            resolve();
        }).catch(function(){
            resolve();
        });
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
