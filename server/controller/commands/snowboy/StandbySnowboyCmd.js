APP.StandbySnowboyCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SnowboyService.start();
        resolve();
    }


    return this;

});
