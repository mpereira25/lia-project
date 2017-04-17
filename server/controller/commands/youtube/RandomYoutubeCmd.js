APP.RandomYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.VideoService.randomVideo();
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
