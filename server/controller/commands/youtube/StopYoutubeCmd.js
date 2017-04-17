APP.StopYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.VideoService.closeVideo();
        _ref.lastServiceLaunch = null;
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
