APP.YoutubeService = function(){


    this.search = function(searchValue){

        var value = '';
        for (var i = 0; i < searchValue.length; i++) {
            if(i != 0){
                value += '+';
            }
            value += searchValue[i];
        }

        return new Promise(function(resolve, reject){
            console.log('YoutubeService search ' + value);

            var urlSearch = 'https://www.youtube.com/results?search_query=' + value;
            var url = 'https:' + '//cors-anywhere.herokuapp.com/' + urlSearch;

            var xhr = new XMLHttpRequest();
            //xhr.responseType = 'arraybuffer';

            xhr.onreadystatechange = handler;

            //alert(value);

            function handler() {
                if (this.readyState === this.DONE) {
                    if (this.status === 200) {  }
                    else { reject(this); }
                }
            };

            xhr.onload = function(e) {
                console.log('YoutubeService result');
                //alert(this.responseText);

                var str = this.responseText;
                var urlsVideos = [];
                var index = str.indexOf('/watch?v=');
                var temp;
                var urlVideo;
                var title;
                var lastUrlVideo;

                //alert(index);

                while(index != -1){
                    temp = str.substr(index, str.length);
                    urlVideo = str.substr(index, temp.indexOf('"'));
                    str = str.substr(index + temp.indexOf('"') + 1 , str.length);

                    if(urlVideo == lastUrlVideo){
                        // recup title
                        index = str.indexOf('>');
                        str = str.substr(index + 1 , str.length);
                        index = str.indexOf('<');
                        title = str.substr(0, index);

                        urlsVideos.push({
                            urlVideo: urlVideo,
                            title: title
                        });
                    }
                    lastUrlVideo = urlVideo;

                    index = str.indexOf('/watch?v=');
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
            };

            xhr.open('GET', url, true);
            xhr.send();
        });


    };

    return this;
};