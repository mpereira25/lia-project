APP.EnterHomeCmd = (function(ref){

    var _ref = ref;
    var _this = this;

    this.execute = function(resolve, words){

        var command = new APP.WakeupSnowboyCmd(this);
        command.execute(function(){});

        var date = new Date();
        var hour = date.getHours();
        if(hour > 19 || hour < 7){
            _this.lightOn(words);
        }else{
            setTimeout(function(){
                APP.services.SoundEmotionService.playSound('hello');
                setTimeout(function(){
                    APP.services.talkServeCtrl.speech('contante de vous revoir ' + words);
                }, 500);
            }, 500);
        }

        resolve();
    }

    this.lightOn = function(words){
        var nb = APP.models.CommandsModel.LISTENING_WORDS_ACTION.length;
        var i;
        var currentProcess;
        var cmds = [];
        for (i = 0; i < nb; i++) {
            currentProcess = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i];
            if(currentProcess.id === 'light_on_entrée' ||
                currentProcess.id === 'light_on_saloon' ||
                currentProcess.id === 'light_on_bureau'
            ) {
                cmds.push(currentProcess);
            }
        }

        nb = cmds.length;

        var func = function(i, nb, words){
            setTimeout((function(i, nb, words){return function(){
                var CommandClass = APP[cmds[i].commandClasses[0]];
                command = new CommandClass(this);
                command.execute(function(){}, cmds[i]);

                if(i+1 < nb){
                    func(i+1, nb, words);
                }else{
                    setTimeout(function(){
                        APP.services.SoundEmotionService.playSound('hello');
                        setTimeout(function(){
                            APP.services.talkServeCtrl.speech('contante de vous revoir ' + words);
                        }, 500);
                    }, 500);
                }
            };})(i, nb, words), 600);
        }
        func(0, nb, words);
    }


    return this;

});
