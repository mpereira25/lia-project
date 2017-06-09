import React from 'react';
import {render} from 'react-dom';
import MainModelController from './model/controller/MainModelController';
import { Router, browserHistory } from 'react-router'
// import routes and pass them into <Router/>
import routes from './routes'

// init MainModel from json from server if exist
try {
    if(ModelServer) {
        //MainModel.initDatasFromObject(JSON.parse(ModelServer));
    }
}catch (e) {

}

window.onload = function() {
    MainModelController.getConfig(() => {
        render(<Router routes={routes} history={browserHistory}/>, document.getElementById('app'));
    });
};
