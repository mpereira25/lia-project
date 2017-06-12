import MainModelController from '../model/controller/MainModelController';

class URLUtils {

    static getUrlCmd(idCmd){
        return '/?idcmd=' + idCmd + '&key=' + MainModelController.model.secret;
    }

    static getUrlService(serviceId){
        return '/?service=' + serviceId + '&key=' + MainModelController.model.secret;
    }

    static getUrlCameraStream(){
        const login = MainModelController.model.configJson.hosts.cameraStream.login;
        const pass = MainModelController.model.configJson.hosts.cameraStream.pass;
        const port = MainModelController.model.configJson.hosts.cameraStream.port;
        return 'https://' + MainModelController.model.domain + ':' + port + '/?action=stream';
    }

}

export default URLUtils;
