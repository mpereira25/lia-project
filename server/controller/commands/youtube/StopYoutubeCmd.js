APP.StopYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.VideoService.closeVideo();
        _ref.lastServiceLaunch = null;
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
