APP.TurnArroundRobotCmd = (function(ref){

    var _ref = ref;

    this.execute = function(resolve){
        if(APP.services.RobotDAO.disabled){
            resolve();
            return;
        }

        APP.services.SoundEmotionService.playSound('talk');
        APP.services.RobotDAO.rotateLeft();
        setTimeout(function(){
          APP.services.RobotDAO.stop();
        }, 1000);
        resolve();
    }


    return this;

});
