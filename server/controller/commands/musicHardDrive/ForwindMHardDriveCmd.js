APP.ForwindMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.MusicService.forwind();
        resolve();
    }


    return this;

});
