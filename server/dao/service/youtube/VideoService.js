var RSVP = require('rsvp');

APP.VideoService = (function(){

    var _ref = this;
    var _currentIndex = 0;
    var _currentChild = null;

    this.listVideos = [];


    this.setListVideos = function(value){
        console.log('setListVideos');
        console.log(value);

        _currentIndex = 0;
        _ref.listVideos = value;
    };

    this.play = function(){
        return _ref.playVideo(_ref.listVideos[_currentIndex]);
    };

    this.playVideo = function(obj){

        var url = obj.url;
        var title = obj.title;

        console.log('playVideo ' + url);
        console.log('title ' + title);
        var host = '';

        // windows
        var winCmd = 'start';

        //linus
        var linuxCmd = 'epiphany-browser';


        //opn(host + url, {app: 'firefox'});
        /*opn(host + url).then(function(){

        }).catch(function(error){
            console.log(error);
        });*/

        var handler = function(){
            var exec = require('child_process').exec;
            _currentChild = exec(linuxCmd + ' "' + host + url + '"');
            _currentChild.stdout.on('data', function(data) {
                console.log('stdout: ' + data);
            });
            _currentChild.stderr.on('data', function(data) {
                console.log('stdout: ' + data);
            });
            _currentChild.on('close', function(code) {
                console.log('closing code: ' + code);
            });

        }

        if(_currentChild){
            _ref.closeVideo(function(){
                handler();
            });
        }else{
            handler();
        }

        return new RSVP.Promise(function(resolve, reject){
            resolve(title);
        });
    };
    this.closeVideo = function(callback){

        // windows
        var winCmd = 'taskkill /f /im vivaldi.exe';

        //linus
        var linuxCmd = 'sudo killall epiphany-browser';

        _currentChild = null;

        var exec = require('child_process').exec;
        var child = exec(linuxCmd);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);

            if(callback){
                callback();
            }
        });
    };

    this.nextVideo = function(){
        _currentIndex++;
        if(_currentIndex < _ref.listVideos.length){
            return _ref.playVideo(_ref.listVideos[_currentIndex]);
        }
    };
    this.prevVideo = function(){
        _currentIndex--;
        if(_currentIndex >= 0){
            return _ref.playVideo(_ref.listVideos[_currentIndex]);
        }
    };
    this.randomVideo = function(){
        var randomIndex = _currentIndex;
        while(randomIndex == _currentIndex){
            randomIndex = parseInt(Math.random() * (_ref.listVideos.length-1));
        }

        _currentIndex = randomIndex;
        return _ref.playVideo(_ref.listVideos[_currentIndex]);
    };

    return this;

});
