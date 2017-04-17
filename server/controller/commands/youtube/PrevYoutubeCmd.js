APP.PrevYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.VideoService.prevVideo();
        APP.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
