APP.PrevYoutubeCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.VideoService.prevVideo();
        APP.services.SoundEmotionService.playSound('talk');
        resolve();
    }


    return this;

});
