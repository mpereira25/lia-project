APP.NextYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.VideoService.nextVideo();
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
