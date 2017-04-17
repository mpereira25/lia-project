APP.RandomCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve, powerFullProcess, words, lastServiceLaunch){
        var command;
        switch (lastServiceLaunch) {
            case 'soundcloud':
                command = new APP.RandomSoundcloudCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'music':
                command = new APP.RandomMHardDriveCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            case 'youtube':
                command = new APP.RandomYoutubeCmd(_ref);
                command.execute(resolve, powerFullProcess, words);
                break;
            default:
                resolve();
                break;
        }
    }


    return this;

});
