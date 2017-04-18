APP.TalkServeCtrl = function(){


    var isLoading = false;

    var processLearning = null;
    var confirmStep = false;
    var wordToConfirm = false;
    var nameClient = null;

    var lastServiceLaunch = null;
    var _ref = this;

    APP.services.socketController.addEventListener(APP.services.socketController.ON_TALK_END, function(event, data){
        if(lastServiceLaunch === 'searchWeb' || lastServiceLaunch === 'getNews'){
            lastServiceLaunch = null;
            releaseTalk();
        }
    }, this);

    APP.services.socketController.addEventListener(APP.services.socketController.ON_TALK, function(event, data){
        //console.log('callBackTalk ' + data);

        data = data.split(',')[0];

        console.log(data);

        if(isLoading) return;

        isLoading = true;

        var nb, nb2;
        var i, j;
        var power = 0;
        var currentPower = 0;
        var words = data.split(' ');
        var index;
        var powerFullProcess;
        var flag = true;

        // remove ignore words
        nb = APP.models.CommandsModel.wordsToIgnore.length;
        for (i = 0; i < nb; i++) {
            index = words.indexOf(APP.models.CommandsModel.wordsToIgnore[i]);
            if(index != -1){
                words.splice(index, 1);
            }
        }

        if(!processLearning) {
            nb = APP.models.TalkModel.LISTENING_WORDS_TALK.length;
            nb2 = words.length;

            for (i = 0; i < nb && flag; i++) {
                currentPower = 0;
                for (j = 0; j < nb2; j++) {
                    if(APP.models.TalkModel.LISTENING_WORDS_TALK[i].keyWords.indexOf(words[j]) != -1){
                        currentPower++;
                    }
                }
                if(currentPower > power) {
                    power = currentPower;
                    powerFullProcess = APP.models.TalkModel.LISTENING_WORDS_TALK[i];
                    if(currentPower == nb2 && currentPower == APP.models.TalkModel.LISTENING_WORDS_TALK[i].keyWords.split(' ').length){
                        flag = false;
                    }
                }
            }


            nb = APP.models.CommandsModel.LISTENING_WORDS_ACTION.length;

            var keywords;
            var k;
            for (i = 0; i < nb && flag; i++) {
                currentPower = 0;
                for (j = 0; j < nb2; j++) {
                    keywords = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i].keyWords.split(' ');

                    for (k = 0; k < keywords.length; k++) {
                        if(keywords[k].indexOf(words[j]) != -1){
                            currentPower++;
                        }
                    }

                }
                if(currentPower > power && Math.abs(nb2 - keywords.length) <= 3 ) {
                    power = currentPower;
                    powerFullProcess = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i];
                    if(currentPower == nb2){
                        flag = false;
                    }
                }
            }

            if(powerFullProcess) {

                if( ((lastServiceLaunch === 'searchWeb' || lastServiceLaunch === 'getNews') && powerFullProcess.id === 'stop') ||
                    !lastServiceLaunch ||
                    (lastServiceLaunch !== 'searchWeb' && lastServiceLaunch !== 'getNews')) {

                    APP.services.SnowboyService.countStandBy = 0;

                    switch(powerFullProcess.type){
                        case 'execute':
                            APP.services.DispatcherCommands.run(words, powerFullProcess, lastServiceLaunch).then(function(){
                                lastServiceLaunch = APP.services.DispatcherCommands.lastServiceLaunch;
                                console.log('lastServiceLaunch : ' + lastServiceLaunch);
                            }).catch(function(){

                            });
                            releaseTalk();
                            break;
                        case 'talk':
                            if(powerFullProcess.id == 'talk_1')
                            {
                                nameClient = null;
                                APP.services.SoundEmotionService.playSound('hello');
                            }
                            else if(powerFullProcess.id == 'talk_3')
                            {
                                APP.services.SoundEmotionService.playSound('talk');
                            }else{
                                APP.services.SoundEmotionService.playSound('talk');
                            }

                            /*if(!nameClient){
                                if(powerFullProcess.initiativesNoName){
                                    processLearning = APP.models.TalkModel.getRandomInitiative(powerFullProcess);
                                    _ref.speech(powerFullProcess.answer[0] + '. ' + APP.models.TalkModel.getQuestionsRandom(processLearning));
                                }else{
                                    _ref.speech(powerFullProcess.answer[0]);
                                }
                            }else{
                                if(powerFullProcess.initiatives){
                                    processLearning = APP.models.TalkModel.getRandomInitiative(powerFullProcess, nameClient);
                                    _ref.speech(powerFullProcess.answer[0] + '. ' + APP.models.TalkModel.getQuestionsRandom(processLearning, nameClient));
                                }else{
                                    _ref.speech(powerFullProcess.answer[0]);
                                }
                            }*/
                            releaseTalk();
                            break;
                        default:
                            APP.services.SoundEmotionService.playSound('talk');
                            releaseTalk();
                            break;
                    }
                }else{
                    releaseTalk();
                }
            }else{
                APP.services.SoundEmotionService.playSound('talk');
                releaseTalk();
            }
        }else{

            if(!confirmStep){
                confirmStep = true;
                wordToConfirm = data;
                switch (processLearning.id){
                    case 'gotName':
                        _ref.speech(processLearning.confirm[0].replace('{0}', data));
                        break;
                    case 'gotLike':
                        _ref.speech(processLearning.confirm[0].replace('{0}', data));
                        break;
                    case 'gotWord':
                        _ref.speech(processLearning.confirm[0].replace('{0}', data));
                        break;
                }
                releaseTalk();
            }else{
                if(data == 'oui'){
                    switch (processLearning.id){
                        case 'gotName':
                            nameClient = wordToConfirm;
                            console.log('gotName confirmed ' + nameClient);
                            break;
                        case 'gotLike':
                            console.log('gotLike confirmed ' + data);
                            break;
                        case 'gotWord':
                            console.log('gotWord confirmed ' + data);
                            break;
                    }
                }else{
                    nameClient = null;
                }

                wordToConfirm = null;
                confirmStep = false;
                processLearning = null;

                releaseTalk();
            }


        }



    }, this);

    this.speech = function(msg){
        APP.services.socketController.talk(APP.SOCKET_MESSAGE.TALK, msg);

        var split2 = msg.split('||');
        var paramMsg = split2[0];
        var param = split2.length > 1 ? split2[1] : null;

        APP.services.DevicesService.textToSpeech(paramMsg).then(function(){
            APP.services.socketController.sendAction('textToSpeech_end', paramMsg);
        }).catch(function(){
            APP.services.socketController.sendAction('textToSpeech_end_failed', msg);
        });
    };

    var releaseTalk = function(){
        isLoading = false;
    };

    return this;
};
