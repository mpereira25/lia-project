APP.PrevCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words, lastServiceLaunch){
        var command;
        switch (lastServiceLaunch) {
            case 'youtube':
                command = new APP.PrevYoutubeCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'soundcloud':
                command = new APP.PrevSoundcloudCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'vlc':
                command = new APP.PrevVlcCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'music':
                command = new APP.PrevMHardDriveCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            default:
                resolve();
                break;
        }
    }


    return this;

});
