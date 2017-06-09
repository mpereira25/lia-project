import DatasEvent from '../evt/DatasEvent.js';
import http from 'http';
import $ from 'jquery';

class SearchService {

    constructor() {

    }

    getList (url) {

        var promise = new Promise(function(resolve, reject) {

             var options = {
                 host: '',
                 path: url ? url : '/assets/test.htm',
                 method: 'GET'
             };

             http.get(options, function(response) {
                 console.log("Got response: " + response.statusCode);
                 var images = [];

                 response.on("data", function(chunk) {
                     //console.log("BODY: " + chunk);


                     var str = chunk.toString();
                     var index = str.indexOf('<img');
                     while(index != -1) {
                         var temp = str.substr(index, str.length);
                         temp = temp.substr(temp.indexOf('src='), temp.length);
                         temp = temp.substr(5, temp.length);
                         images.push(temp.substr(0, temp.indexOf('"')));

                         str = temp;
                         index = str.indexOf('<img');
                     }


                 });


                 response.on("end", function(chunk) {
                     //console.log(images);

                     var items = [];
                     for(var i = 0; i < images.length;i++) {
                         items.push({
                             count: parseInt(Math.random()*10),
                             id: 'serviceItem_' + i,
                             image: images[i]
                         });
                     }

                     resolve(items);
                 });
             });
        });

        return promise;
    }

}

export default new SearchService();
