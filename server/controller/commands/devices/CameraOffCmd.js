APP.CameraOffCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.DevicesService.cameraOff();
        resolve();
    }


    return this;

});
