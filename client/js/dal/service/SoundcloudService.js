APP.SoundcloudService = function(){

    var _player = null;

    var _tracks = null;
    var _currentTrack = null;
    var _currentIndex = 0;
    var _ref = this;

    this.init = function(){

        $.getJSON("datas/config.json", function(json) {
            console.log(json); // this will show the info it in firebug console

            SC.initialize({
              client_id: json.soundcloudModule.key
            });
        });


    }

    this.search = function(searchValue){
        return new RSVP.Promise(function(resolve, reject){

            if(searchValue.indexOf('/user') !== -1 && searchValue.indexOf('/tracks') !== -1) {
                SC.get(searchValue, {}).then(function(tracks){
                     _tracks = tracks;
                     resolve(_tracks);
                }, function(){
                     reject();
                });
            }else{
                SC.get('/tracks', { q: searchValue}).then(function(tracks){
                     _tracks = tracks;
                     resolve(_tracks);
                }, function(){
                     reject();
                });
            }
        });
    };

    this.play = function(){
        return _ref.playTrack(_tracks[_currentIndex]);
    };

    this.playTrack = function(track){
        _currentTrack = track;
        return new RSVP.Promise(function(resolve, reject){
            SC.stream('/tracks/' + track.id).then(function(player){
                _ref.stop();
                _player = player;
                _player.play();
                resolve({title: track.title});
            });
        });
    };

    this.stop = function(){
        if(_player){
            _player.pause();
        }
    };
    this.next = function(){
        _currentIndex++;
        if(_currentIndex < _tracks.length){
            return _ref.playTrack(_tracks[_currentIndex]);
        }
    };
    this.prev = function(){
        _currentIndex--;
        if(_currentIndex >= 0){
            return _ref.playTrack(_tracks[_currentIndex]);
        }
    };
    this.random = function(){
        var randomIndex = _currentIndex;
        while(randomIndex == _currentIndex){
            randomIndex = parseInt(Math.random() * (_tracks.length-1));
        }

        _currentIndex = randomIndex;
        return _ref.playTrack(_tracks[_currentIndex]);
    };

    this.getCurrentTitle = function(){
        if(!_currentTrack) return null;
        return _currentTrack.title;
    };

    return this;
};
