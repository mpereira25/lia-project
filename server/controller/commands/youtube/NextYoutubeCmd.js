APP.NextYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.VideoService.nextVideo();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
