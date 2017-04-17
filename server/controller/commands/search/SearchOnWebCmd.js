APP.SearchOnWebCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words){
        runSearchWeb(powerFullProcess, words, resolve);
    }

    function runSearchWeb(powerFullProcess, words, resolve) {
        APP.SoundEmotionService.playSound('happy');
        var searchValue;
        var wordsToIgnore = 'les le la un une des est qui qu\'est-ce que'.split(' ');

        // remove ignore words
        var ignore = powerFullProcess.keyWords.split(' ');
        var nb;
        var j;
        var index;

        var ignore2 = ignore[0].split('||').concat(wordsToIgnore);
        nb = ignore2.length;
        for (j = 0; j < nb; j++) {
            index = words.indexOf(ignore2[j]);
            if(index != -1){
                words.splice(index, 1);
            }
        }

        searchValue = words;

        APP.SearchService.search(searchValue).then(function(result){
            console.log(result);

            if(result.length > 0){
                _ref.lastServiceLaunch = 'searchWeb';
                _ref.talkController.speech(result[0].text + '||true');
                resolve()
            }else{
                APP.SoundEmotionService.playSound('sad');
                _ref.talkController.speech('Aucun résultats');
                resolve();
            }
        }).catch(function(error){
            console.log('error ' + error);
            APP.SoundEmotionService.playSound('sad');
            _ref.talkController.speech('Aucun résultats');
            resolve();
        });

    };

    return this;

});
