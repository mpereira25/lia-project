APP.MusicModule = (function(){

    this.init = function(){
        APP.services.MusicService = new APP.MusicService();
        APP.services.MusicService.networkLibPath = ['mp3/', 'mp3_2/'];
        APP.services.MusicService.getListMusic('/data/Musiques/');
    }


    return this;

});
