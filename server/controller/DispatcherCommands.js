APP.DispatcherCommands = function(){

    this.lastServiceLaunch = null;
    var _ref = this;

    this.run = function(words, powerFullProcess, lastServiceLaunch){

        _ref.lastServiceLaunch = lastServiceLaunch;

        return new RSVP.Promise(function(resolve, reject){
            var command;
            var CommandClass;

            if(powerFullProcess.commandClasses && powerFullProcess.commandClasses.length > 0){

                if(!powerFullProcess.module ||
                    (powerFullProcess.module && APP.modules[powerFullProcess.module])) {
                    CommandClass = APP[powerFullProcess.commandClasses[0]];
                    command = new CommandClass(_ref);
                    command.execute(resolve, powerFullProcess, words, lastServiceLaunch, true);
                }else{
                    console.log("----------");
                    console.log("ERROR module " + powerFullProcess.module + ' not exist');
                    console.log("----------");
                    resolve();
                }
            }else if(powerFullProcess.dependanciesCommandClasses && powerFullProcess.dependanciesCommandClasses[_ref.lastServiceLaunch]) {
                CommandClass = APP[powerFullProcess.dependanciesCommandClasses[_ref.lastServiceLaunch]];
                command = new CommandClass(_ref);
                command.execute(resolve, powerFullProcess, words, lastServiceLaunch);

            }else if(powerFullProcess.commandIds && powerFullProcess.commandIds.length > 0) {
                console.log(powerFullProcess.commandIds);
                _ref._runNextIdCmd(resolve, words, 0, powerFullProcess, lastServiceLaunch);
            }else{
                resolve();
            }

        });
    };

    this._runNextIdCmd = function(resolve, words, indexCmd, powerFullProcess, lastServiceLaunch){

        if(indexCmd < powerFullProcess.commandIds.length) {
            var processCmd = APP.models.CommandsModel.getCmdFromId(powerFullProcess.commandIds[indexCmd]);
            if(processCmd) {
                (new APP.DispatcherCommands()).run(words, processCmd, lastServiceLaunch).then(function(){
                    setTimeout(function(){
                        _ref._runNextIdCmd(resolve, words, indexCmd+1, powerFullProcess, lastServiceLaunch)
                    }, 600);
                });
            }else{
                resolve();
            }
        }else{
            resolve();
        }
    };

    return this;
};
