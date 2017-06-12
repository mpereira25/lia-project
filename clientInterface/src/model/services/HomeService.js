import http from 'http';
import $ from 'jquery';
import URLUtils from '../../utils/URLUtils';
import DatasEvent from '../evt/DatasEvent.js';

class HomeService {

    constructor() {

    }

    getTemperatures (refresh) {

        let promise = new Promise(function(resolve, reject) {

             var options = {
                 host: '',
                 path: URLUtils.getUrlService('getTemperatures') + '&refresh=' + refresh,
                 method: 'GET'
             };

             http.get(options, function(response) {
                 console.log("getTemperatures response: " + response.statusCode);
                 let body = '';

                 response.on("data", function(chunk) {
                     body += chunk;
                 });


                 response.on("end", function() {
                     resolve(JSON.parse(body));
                 });
             });
        });

        return promise;
    }

}

export default HomeService;
