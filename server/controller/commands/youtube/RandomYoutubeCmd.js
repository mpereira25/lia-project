APP.RandomYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.VideoService.randomVideo();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
