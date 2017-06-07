APP.CameraOnCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.cameraOn();
        resolve();
    }


    return this;

});
