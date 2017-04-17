APP.GetTitleCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words, lastServiceLaunch){
        var command;
        switch (lastServiceLaunch) {
            case 'soundcloud':
                command = new APP.GetTitleSoundcloudCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'music':
                command = new APP.GetTitleMHardDriveCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            default:
                resolve();
                break;
        }
    }


    return this;

});
