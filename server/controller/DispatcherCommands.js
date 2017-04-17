APP.DispatcherCommands = function(socketController, talkController){

    this.lastServiceLaunch = null;
    this.socketController = socketController;
    this.talkController = talkController;
    var _ref = this;

    this.run = function(words, powerFullProcess, lastServiceLaunch){

        _ref.lastServiceLaunch = lastServiceLaunch;

        return new RSVP.Promise(function(resolve, reject){
            var command;
            var CommandClass;

            if(powerFullProcess.commandClasses && powerFullProcess.commandClasses.length > 0){
                CommandClass = powerFullProcess.commandClasses[0];
                command = new CommandClass(_ref);
                command.execute(resolve, powerFullProcess, words, lastServiceLaunch);
            }else{
                resolve();
            }

        });
    };

    return this;
};
