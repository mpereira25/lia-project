APP.YoutubeModule = (function(){

    var _ref = this;

    this.init = function(){
        APP.services.VideoService = new APP.VideoService();
        APP.services.YoutubeService = new APP.YoutubeService();
    }

    return this;

});
