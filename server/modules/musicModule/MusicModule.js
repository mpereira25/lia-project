var fs = require('fs');

APP.MusicModule = (function(){

    this.init = function(){
        APP.services.MusicService = new APP.MusicService();

        APP.services.MusicService.networkLibPath = APP.configJSON.musicModule.networkPath;

        var nb = APP.configJSON.musicModule.path.length;
        var  i = 0;
        for(i = 0; i < nb; i++) {
            APP.services.MusicService.getListMusic(APP.configJSON.musicModule.path[i]);
        }
    }


    return this;

});
