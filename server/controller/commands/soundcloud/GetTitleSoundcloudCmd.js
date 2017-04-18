APP.GetTitleSoundcloudCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        APP.services.socketController.sendAction('soundcloud_gettitle', 'soundcloud_gettitle');
        resolve();
    }


    return this;

});
