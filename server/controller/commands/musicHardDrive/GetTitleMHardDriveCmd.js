APP.GetTitleMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.talkServeCtrl.speech('Lecture en cours. ' + APP.services.MusicService.getCurrentTitle());
        resolve();
    }


    return this;

});
