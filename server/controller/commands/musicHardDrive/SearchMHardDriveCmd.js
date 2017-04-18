APP.SearchMHardDriveCmd = (function(ref){

    var _ref = ref;
    this.execute = function(resolve, powerFullProcess, words){

        if(words === '') {
            var command = new APP.PlayAllMHardDriveCmd(_ref);
            command.execute(resolve, powerFullProcess, words);
            return;
        }

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
            APP.services.MusicService.search(searchValue).then(function(result){
                if(result && result.length == 0){
                    APP.services.SoundEmotionService.playSound('sad');
                    APP.services.talkServeCtrl.speech('Aucun résultats');
                }else{
                    _ref.lastServiceLaunch = 'MusicModule';
                    APP.services.MusicService.playList(result);
                    APP.services.SoundEmotionService.playSound('happy');
                    //_ref.talkController.speech('Lecture en cours. ' + APP.MusicService.getCurrentTitle());
                }
                resolve();
            });
        };

        if(APP.services.MusicService.networkLibPath.length > 0){
            if(!APP.services.MusicService.networkLibLoaded) {
                APP.services.MusicService.checkNetwork().then(function () {
                    APP.services.MusicService.getListNetworkMusic().then(function () {
                        APP.services.MusicService.networkAvailable = true;
                        APP.services.MusicService.networkLibLoaded = true;
                        funcSearch();
                    }).catch(function () {
                        APP.services.MusicService.networkAvailable = false;
                        APP.services.MusicService.networkLibLoaded = false;
                        funcSearch();
                    })
                }).catch(function () {
                    APP.services.MusicService.networkAvailable = false;
                    funcSearch();
                });


            }else{
                APP.services.MusicService.checkNetwork().then(function () {
                    APP.services.MusicService.networkAvailable = true;
                    funcSearch();
                }).catch(function () {
                    APP.services.MusicService.networkAvailable = false;
                    funcSearch();
                });
            }
        }else{
            APP.services.MusicService.networkAvailable = false;
            funcSearch();
        }
    }

    return this;

});
