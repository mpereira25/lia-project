APP.SearchMHardDriveCmd = (function(ref){

    var _ref = ref;
    this.execute = function(resolve, powerFullProcess, words){
        var searchValue;
        // remove ignore words
        var ignore = powerFullProcess.keyWords.split(' ');
        var nb = ignore.length;
        var i;
        var index;
        for (i = 0; i < nb; i++) {
            index = words.indexOf(ignore[i]);
            if(index != -1){
                words.splice(index, 1);
            }
        }

        searchValue = words;

        var funcSearch = function(){
            APP.MusicService.search(searchValue).then(function(result){
                if(result && result.length == 0){
                    APP.SoundEmotionService.playSound('sad');
                    _ref.talkController.speech('Aucun résultats');
                }else{
                    _ref.lastServiceLaunch = 'music';
                    APP.MusicService.playList(result);
                    APP.SoundEmotionService.playSound('happy');
                    //_ref.talkController.speech('Lecture en cours. ' + APP.MusicService.getCurrentTitle());
                }
                resolve();
            });
        };

        if(APP.MusicService.networkLibPath.length > 0){
            if(!APP.MusicService.networkLibLoaded) {
                APP.MusicService.checkNetwork().then(function () {
                    APP.MusicService.getListNetworkMusic().then(function () {
                        APP.MusicService.networkAvailable = true;
                        APP.MusicService.networkLibLoaded = true;
                        funcSearch();
                    }).catch(function () {
                        APP.MusicService.networkAvailable = false;
                        APP.MusicService.networkLibLoaded = false;
                        funcSearch();
                    })
                }).catch(function () {
                    APP.MusicService.networkAvailable = false;
                    funcSearch();
                });


            }else{
                APP.MusicService.checkNetwork().then(function () {
                    APP.MusicService.networkAvailable = true;
                    funcSearch();
                }).catch(function () {
                    APP.MusicService.networkAvailable = false;
                    funcSearch();
                });
            }
        }else{
            APP.MusicService.networkAvailable = false;
            funcSearch();
        }
    }

    return this;

});
