var RSVP = require('rsvp');
var https = require('https');
var http = require('http');
var Xml2js = require('xml2js');
var Html5Entities = require('html-entities').Html5Entities;

APP.SearchService = (function(){

    this.newsList = [];
    this.currentIndex = 0;

    this.search = function(searchValue){
        var value = '';

        for (var i = 0; i < searchValue.length; i++) {
            if(i != 0){
                value += '+';
            }
            if(searchValue[i] != 'de' && i == 0){
                value += searchValue[i].charAt(0).toUpperCase() + searchValue[i].substr(1, searchValue[i].length);
            }else{
                value += searchValue[i];
            }
        }

        return new RSVP.Promise(function(resolve, reject){
            console.log('SearchService search ' + value);

            var urlSearch = 'https://fr.wikipedia.org/w/index.php?title=Spécial%3ARecherche&profile=default&fulltext=1&searchengineselect=mediawiki&search=' + encodeURI(value);
            var url = 'https:' + '//cors-anywhere.herokuapp.com/' + urlSearch;

            console.log(urlSearch);

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

                    var ret = [];
                    console.log('SearchService result');
                    //console.log(body);

                    var str = body;
                    var index = body.indexOf('mw-content-text');
                    var indexpartSearch = body.indexOf('mw-search-results');

                    if(indexpartSearch > -1) {
                      str = str.substr(indexpartSearch, str.length);
                      index = str.indexOf('<a');
                      str = str.substr(index, str.length);
                      index = str.indexOf('href="');
                      str = str.substr(index+6, str.length);
                      index = str.indexOf('"');
                      str = str.substr(0, index);

                      console.log('page to load ' + str);
                      https.get('https://fr.wikipedia.org' + str, function(response) {
                          // Continuously update stream with data
                          var body2 = '';
                          response.on('data', function(d) {
                              body2 += d;
                          });
                          response.on('error', function(d) {
                              reject();
                          });
                          response.on('end', function() {
                            str = body2;
                            index = str.indexOf('mw-content-text');

                            str = str.substr(index, str.length);

                            index = str.indexOf('bandeau-article');
                            if(index > -1){
                                str = str.substr(index, str.length);
                                index = str.indexOf('<div');
                                str = str.substr(index+1, str.length);
                                index = str.indexOf('<div');
                                str = str.substr(index+1, str.length);
                                index = str.indexOf('</div>');
                                str = str.substr(index+1, str.length);
                                index = str.indexOf('</div>');
                                str = str.substr(index+1, str.length);
                            }

                            index = str.indexOf('<p>');
                            str = str.substr(index, str.length);
                            str = str.substr(3, str.indexOf('</p>') - 3);

                            ret.push({
                                text: Html5Entities.decode(str.replace(/<[^>]*>/g, ""))
                            });

                            resolve(ret);
                          });
                      });

                    }else{
                      str = str.substr(index, str.length);

                      index = str.indexOf('bandeau-article');
                      if(index > -1){
                          index = str.indexOf('<p>');
                          str = str.substr(index, str.length);
                          str = str.substr(3, str.indexOf('</p>'));
                      }

                      index = str.indexOf('<p>');
                      str = str.substr(index, str.length);
                      str = str.substr(3, str.indexOf('</p>') - 3);

                      ret.push({
                          text: Html5Entities.decode(str.replace(/<[^>]*>/g, ""))
                      });

                      resolve(ret);
                    }


                });
            });

        });


    };

    this.getNews = function() {
      var rssLeMonde = 'http://www.lemonde.fr/rss/une.xml';
      var ref = this;

      return new RSVP.Promise(function(resolve, reject){
        console.log(rssLeMonde);

        http.get(rssLeMonde, function(response) {
            // Continuously update stream with data
            console.log('Response getNews');
            var xmlStr = '';
            response.on('data', function(d) {
                xmlStr += d;
            });
            response.on('error', function(d) {
                console.log('Error getNews');
                console.log(e);
                reject();
            });
            response.on('end', function() {
              var ret = [];
              console.log('Success getNews');
              //console.log(xmlStr);
              Xml2js.parseString(xmlStr, function (err, result) {
                  console.log(result);
                  console.log( result.rss.channel[0]);
                  var i, nb ;
                  var item;
                  nb = result.rss.channel[0].item.length;
                  for(var i = 0; i < nb; i++) {
                    item = result.rss.channel[0].item[i];
                    ret.push(
                      {
                        title: item.title,
                        description: item.description
                      });
                  }
                  ref.newsList = ret;
                  resolve(ret);
              });
            });
          });
      });
    }

    return this;
});
