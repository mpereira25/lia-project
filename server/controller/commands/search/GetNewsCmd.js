APP.GetNewsCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.SoundEmotionService.playSound('talk');
        APP.SearchService.getNews().then(function(result){
            var titles = '';
            var i, nb ;
            nb = result.length;
            for(var i = 0; i < nb; i++) {
              titles += result[i].title + '. ';
            }
            _ref.lastServiceLaunch = 'getNews';
            _ref.talkController.speech('Titre à la une. ' + titles + '||true');
            resolve();
        }).catch(function(){
            APP.SoundEmotionService.playSound('sad');
            resolve();
        });
    }


    return this;

});
