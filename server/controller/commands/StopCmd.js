APP.StopCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words, lastServiceLaunch){
        var command;
        console.log('StopCmd : ' + lastServiceLaunch);
        switch (lastServiceLaunch) {
            case 'youtube':
                command = new APP.StopYoutubeCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'soundcloud':
                command = new APP.StopSoundcloudCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'vlc':
                command = new APP.StopVlcCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'music':
                command = new APP.StopMHardDriveCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            default:
                resolve();
                break;
        }
    }


    return this;

});
