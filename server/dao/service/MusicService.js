var RSVP = require('rsvp');

APP.MusicService = (function(){

    var _ref = this;
    const fs = require('fs');

    var _currentPlayList = 0;
    var _currentIndexPlaylist = 0;
    var _list = [];
    var _listNetwork = [];

    this.networkLibLoaded = false;
    this.networkAvailable = false;
    this.networkLibPath = [];


    this.getListMusic = function(path, network){

        return new RSVP.Promise(function(resolve, reject) {
            var nb;
            var countDir = 1;
            var countDirComplete = 0;

            var func = function(path, network){
                fs.readdir(path, function(err, files) {
                    if(err){
                        countDirComplete++;
                        if(countDir == 1){
                            reject();
                        }else{
                            console.log('   ' + path + ' : ' + 'ERROR');
                        }
                        return;
                    }
                    countDirComplete++;

                    nb = files.length;
                    for (var i = 0; i < nb; i++) {
                        if(files[i].indexOf('.mp3') != -1){
                            if(network == true){
                                _listNetwork.push(path + files[i]);
                            }else{
                                _list.push(path + files[i]);
                            }
                        }else if(files[i].indexOf('.') == -1){
                            countDir++;
                            func(path + files[i] + '/', network);
                        }
                    }
                    if(countDir == countDirComplete ){
                        if(network == true){
                            console.log('   NB MP3 : ' + _listNetwork.length);
                        }else{
                            console.log('   NB MP3 : ' + _list.length);
                        }

                        resolve();
                    }
                });
            };

            func(path, network);


        });


    };
    this.getListNetworkMusic = function(){
        console.log('>> Scan Lib music network');

        return new RSVP.Promise(function(resolve, reject) {
            var count = 0;
            var nextNetworkPath = function(){
                _ref.getListMusic(_ref.networkLibPath[count], true).then(function(){
                    console.log('   ' + _ref.networkLibPath[count] + ' : ' + 'OK');
                    count++;
                    if(count == _ref.networkLibPath.length){
                        _ref.networkLibLoaded = true;
                        resolve();
                    }else{
                        nextNetworkPath();
                    }
                }).catch(function(){
                    _ref.networkLibLoaded = false;
                    console.log('   ' + _ref.networkLibPath[count] + ' : ' + 'ERROR');
                    reject();
                });
            };

            nextNetworkPath();

        });


    };
    this.search = function(words){
        return new RSVP.Promise(function(resolve, reject) {

            console.log('Search music : ' + words);

            var tabWords = words;
            var result = [];
            var list = _list;
            if(_ref.networkAvailable){
                list = list.concat(_listNetwork);
            }
            var nb = list.length;
            var nb2 = tabWords.length;
            var flag = false;

            for (var i = 0; i < nb; i++) {
                flag = false;
                for (var j = 0; j < nb2; j++) {
                    if(!flag && list[i].toLowerCase().indexOf(tabWords[j]) != -1) {
                        result.push(list[i]);
                        flag = true;
                    }
                }
            }

            console.log('Result ');
            console.log(result);

            resolve(result);


        });
    };
    this.checkNetwork = function() {
        console.log('>> Check Lib music network is available');
        return new RSVP.Promise(function(resolve, reject) {
            var flag = false;
            setTimeout(function(){
                flag = true;
                console.log('   '  + _ref.networkLibPath[0] + ' : NO');
                reject();
            }, 2500);

            fs.readdir(_ref.networkLibPath[0], function(err, files) {
                if(!flag){
                    if (err) {
                        console.log('   '  + _ref.networkLibPath[0] + ' : NO');
                        reject();
                    }else{
                        console.log('   '  + _ref.networkLibPath[0] + ' : YES');
                        resolve();
                    }
                }
            });
        });
    };
    this.playList = function(result) {

        _currentPlayList = result;
        _currentIndexPlaylist = 0;
        _ref.playMusic(_currentPlayList[_currentIndexPlaylist]);
    };

    this.playMusic = function(value) {

        var exec = require('child_process').exec;
        var child = exec('mocp -u shuffle');
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);

        });
        child.on('close', function(code) {
            exec = require('child_process').exec;

            var list = '';
            var nb = _currentPlayList.length-1;
            var indexTemp = _currentPlayList.indexOf(value);
            var count = 0;
            for (var i = indexTemp; i < nb; i++) {
                if(i >= indexTemp ){
                    if( count > 0) {
                        list += ' ';
                    }
                    list += '"' + _currentPlayList[i] + '"';
                    count++;
                }
            }

            console.log('mocp -l ' + list);

            child = exec('mocp -l ' + list);
            child.stdout.on('data', function(data) {
                console.log('stdout: ' + data);
            });
            child.stderr.on('data', function(data) {
                console.log('stdout: ' + data);

            });
            child.on('close', function(code) {
                console.log('closing code: ' + code);
            });
        });
    };
    this.next = function() {
        if(_currentIndexPlaylist+1 < _currentPlayList.length){
            _currentIndexPlaylist++;

            _ref.playMusic(_currentPlayList[_currentIndexPlaylist]);
        }
    };
    this.prev = function() {
        if(_currentIndexPlaylist-1 >= 0){
            _currentIndexPlaylist--;

            _ref.playMusic(_currentPlayList[_currentIndexPlaylist]);
        }
    };
    this.stop = function() {

        var exec = require('child_process').exec;
        var child = exec('mocp -s');
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);

        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };
    this.pause = function() {

        var exec = require('child_process').exec;
        var child = exec('mocp -P');
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);

        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };
    this.resume = function() {

        var exec = require('child_process').exec;
        var child = exec('mocp -U');
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);

        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
        });
    };
    this.getCurrentTitle = function(){
        var title = _currentPlayList[_currentIndexPlaylist];
        var tab = title.split('/');
        title = tab[tab.length-1];
        title = title.substr(0, title.length -4);
        return title;
    };
    return this;

})();