APP.GetTitleSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        _ref.socketController.sendAction('soundcloud_gettitle', 'soundcloud_gettitle');
        resolve();
    }


    return this;

});
