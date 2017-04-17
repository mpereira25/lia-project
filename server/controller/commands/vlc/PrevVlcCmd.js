APP.PrevVlcCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.DevicesService.execute(['mocp -r']).then(function(){
            resolve();
        }).catch(function(){
            resolve();
        });
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
