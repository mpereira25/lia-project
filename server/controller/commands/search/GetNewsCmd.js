APP.GetNewsCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.SoundEmotionService.playSound('talk');
        APP.services.SearchService.getNews().then(function(result){
            var titles = '';
            var i, nb ;
            nb = result.length;
            for(var i = 0; i < nb; i++) {
              titles += result[i].title + '. ';
            }
            _ref.lastServiceLaunch = 'SearchModule';
            APP.services.talkServeCtrl.speech('Titre à la une. ' + titles + '||true');
            resolve();
        }).catch(function(){
            APP.services.SoundEmotionService.playSound('sad');
            resolve();
        });
    }


    return this;

});
