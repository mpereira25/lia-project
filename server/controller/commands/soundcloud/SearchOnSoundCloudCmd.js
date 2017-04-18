APP.SearchOnSoundCloudCmd = (function(dispatcherCmds){

    var _dispatcherCmds = dispatcherCmds;
    var _this = this;

    this.execute = function(resolve, powerFullProcess, words){

        APP.services.socketController.addEventListener(APP.services.socketController.ON_ACTION, function (event, type, data) {

            if( data == '') return;

            switch(type){
                case 'soundcloud_searchsuccess':
                    _dispatcherCmds.lastServiceLaunch = 'SoundcloudModule';
                    resolve();
                    break;
                case 'soundcloud_searcherror':
                    APP.services.SoundEmotionService.playSound('sad');
                    APP.services.talkServeCtrl.speech('Aucun résultats');
                    resolve();
                    break;
                case 'soundcloud_onplay':
                    APP.services.talkServeCtrl.speech('Lecture en cours. ' + data);
                    break;
                case 'soundcloud_onplayerror':
                    resolve();
                    break;
                case 'soundcloud_ontitle':
                    APP.services.talkServeCtrl.speech('Lecture en cours. ' + data);
                    break;
            }
        }, _this);

        runSoundcloud(powerFullProcess, words, resolve);
    }

    function runSoundcloud(powerFullProcess, words, resolve){
        APP.services.SoundEmotionService.playSound('happy');

        var searchValue;
        if(powerFullProcess.userTracks){
            searchValue = powerFullProcess.userTracks;
        }else{
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
        }

        APP.services.socketController.sendAction('soundcloud_search', searchValue);

    };

    return this;

});
