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
            }else{
                resolve();
            }

        });
    };

    return this;
};
