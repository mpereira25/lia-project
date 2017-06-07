APP.WakeupSnowboyCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SnowboyService.stop();
        resolve();
    }


    return this;

});
