var RSVP = require('rsvp');
var https = require('https');
var Html5Entities = require('html-entities').Html5Entities;

APP.YoutubeService = function(){


    this.search = function(searchValue){
        var value = '';
        var isUrlyoutube = false;

        if(searchValue.indexOf('https://www.youtube.com') != -1){
            isUrlyoutube = true;
            value = searchValue;
        }else{
            value = '';
            for (var i = 0; i < searchValue.length; i++) {
                if(i != 0){
                    value += '+';
                }
                value += searchValue[i];
            }
        }

        return new RSVP.Promise(function(resolve, reject){
            console.log('YoutubeService search ' + value);

            var urlSearch;
            if(isUrlyoutube){
                urlSearch = value;
            }else{
                urlSearch = 'https://www.youtube.com/results?search_query=' + encodeURI(value);
            }
            var url = 'https:' + '//cors-anywhere.herokuapp.com/' + urlSearch;

            //console.log(url);

            https.get(urlSearch, function(response) {
                // Continuously update stream with data
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });
                response.on('error', function(d) {
                    reject();
                });
                response.on('end', function() {

                    console.log('YoutubeService result');
                    //alert(body);

                    var str = body;
                    var urlsVideos = [];
                    var index = str.indexOf('/watch?v=');
                    var temp;
                    var urlVideo;
                    var title;
                    var lastUrlVideo;

                    //alert(index);

                    var count = 0;
                    while(index != -1){

                        temp = str.substr(index, str.length);
                        urlVideo = str.substr(index, temp.indexOf('"'));
                        str = str.substr(index + temp.indexOf('"') + 1 , str.length);

                        if(!isUrlyoutube || (isUrlyoutube && count > 0)){
                            if(urlVideo == lastUrlVideo){
                                // recup title
                                index = str.indexOf('>');
                                str = str.substr(index + 1 , str.length);
                                index = str.indexOf('<');
                                title = str.substr(0, index);

                                urlsVideos.push({
                                    urlVideo: 'https://www.youtube.com' + urlVideo,
                                    title: Html5Entities.decode(title.replace('\n', '').replace('\n', '').replace(/^\s\s*/, '').replace(/\s\s*$/, ''))
                                });
                            }
                            lastUrlVideo = urlVideo;
                        }

                        index = str.indexOf('/watch?v=');
                        count++;
                    }

                    //console.log(urlsVideos);

                    var ret = '';
                    for (var i = 0; i < urlsVideos.length; i++) {
                        if(i != 0){
                            ret += '---';
                        }
                        ret += urlsVideos[i].urlVideo + '||' + urlsVideos[i].title;
                    }

                    //alert(urlsVideos);
                    //alert(ret);
                    resolve(ret);
                });
            });

        });


    };

    return this;
};
