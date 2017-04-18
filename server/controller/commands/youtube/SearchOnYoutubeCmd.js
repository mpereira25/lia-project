APP.SearchOnYoutubeCmd = (function(ref){

    var _ref = ref;
    this.execute = function(resolve, powerFullProcess, words){
        runYoutube(powerFullProcess, words, resolve);
    }

    function runYoutube(powerFullProcess, words, resolve){
        APP.services.SoundEmotionService.playSound('happy');

        var searchValue;
        if(powerFullProcess.playlist){
            searchValue = powerFullProcess.playlist;
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

        //_ref.socketController.sendAction('youtube', searchValue);

        APP.services.YoutubeService.search(searchValue).then(function(result){
            console.log(result);
            var split2 = result.split('---');
            var tab = [];

            for (var i = 0; i < split2.length; i++) {
                var tempSplit = split2[i].split('||');

                tab.push({
                    url: tempSplit[0],
                    title: tempSplit[1]
                })
            }
            if(powerFullProcess.playlist){
                tab.unshift({
                    url: powerFullProcess.playlist_watch + '1',
                    title: powerFullProcess.playlist_title
                })
            }
            if(tab.length > 0){
                _ref.lastServiceLaunch = 'YoutubeModule';
                APP.services.VideoService.setListVideos(tab);
                APP.services.VideoService.play().then(function(title){
                    APP.services.talkServeCtrl.speech('Lecture en cours. ' + title);
                    resolve();
                }).catch(function(){
                    resolve();
                });
            }else{
                APP.services.SoundEmotionService.playSound('sad');
                APP.services.talkServeCtrl.speech('Aucun résultats');
                resolve();
            }
        }).catch(function(error){
            console.log('error ' + error);
            APP.services.talkServeCtrl.speech('Aucun résultats');
            APP.services.SoundEmotionService.playSound('sad');
            resolve();
        });
    };

    return this;

});
