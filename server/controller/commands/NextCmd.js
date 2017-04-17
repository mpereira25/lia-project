APP.NextCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words, lastServiceLaunch){
        var command;
        switch (lastServiceLaunch) {
            case 'youtube':
                command = new APP.NextYoutubeCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'soundcloud':
                command = new APP.NextSoundcloudCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'vlc':
                command = new vNextVlcCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'music':
                command = new APP.NextMHardDriveCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            default:
                break;
        }
    }


    return this;

});
