APP.GetTitleMHardDriveCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        _ref.talkController.speech('Lecture en cours. ' + APP.MusicService.getCurrentTitle());
        resolve();
    }


    return this;

});
