APP.MusicModule = (function(){

    this.init = function(){

        APP.MusicService.networkLibPath = ['mp3/', 'mp3_2/'];
        APP.MusicService.getListMusic('/data/Musiques/');
    }


    return this;

});
