APP.HeadLedsView2Controller = function(view, talkController){



    this.start = function(){
        talkController.alwaysListening = true;
        talkController.start();
    };
    this.stop = function(){
        talkController.alwaysListening = false;
        talkController.stop();
    };


    return this;
};