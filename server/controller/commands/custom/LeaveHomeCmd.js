APP.LeaveHomeCmd = (function(ref){

    var _ref = ref;
    var _this = this;

    this.execute = function(resolve, words){

        var command = new APP.StandbySnowboyCmd(this);
        command.execute(function(){});

        var date = new Date();
        var hour = date.getHours();

        APP.services.SoundEmotionService.playSound('sad');
        setTimeout(function(){
            APP.services.talkServeCtrl.speech('A bientôt ' + words);
            setTimeout(function(){
                _this.devicesOff(words, hour > 19 || hour < 7);
            }, 500);
        }, 500);

        resolve();
    }
    this.devicesOff = function(words, lights){
        var nb = APP.models.CommandsModel.LISTENING_WORDS_ACTION.length;
        var i;
        var currentProcess;
        var cmds = [];
        for (i = 0; i < nb; i++) {
            currentProcess = APP.models.CommandsModel.LISTENING_WORDS_ACTION[i];
            if((lights && (currentProcess.id === 'light_off_entrée' ||
                currentProcess.id === 'light_off_saloon' ||
                currentProcess.id === 'light_off_bureau')) ||
                currentProcess.id === 'son_off_télé'
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
                }
            };})(i, nb, words), 600);
        }
        func(0, nb, words);
    }

    return this;

});
