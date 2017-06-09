import React from 'react';
import http from 'http';
import Button from '../../component/Button/Button'
import Loader from '../../component/Loader/Loader'
import URLUtils from '../../../utils/URLUtils';

class Camera extends React.Component {

    constructor(props){
        super(props);
        this.interval = -1;
        this.state = {
            cameraOn: false,
            loader: false,
            image: '',
        }

        this.startCamera = this.startCamera.bind(this);
        this.stopCamera = this.stopCamera.bind(this);
    }

    startCamera() {
        http.get(URLUtils.getUrlCmd('camera_on'));
        this.setState({
            loader: true,
        });
        clearTimeout(this.interval);
        this.interval = setTimeout(() => {
            this.setState({
                cameraOn: true,
                loader: false,
                image: URLUtils.getUrlCameraStream(),
            });
        }, 3000);
    }

    stopCamera() {
        clearTimeout(this.interval);
        http.get(URLUtils.getUrlCmd('camera_off'));
        this.setState({
            cameraOn: false,
            image: '',
        });
    }

    render() {
        const { cameraOn, image, loader } = this.state;

        return (
            <div className="camera">
                <h2 className="title" >Caméra</h2>
                <div className="camera__ctBtn">
                    <Button onClick={this.startCamera} selected={cameraOn}>ON</Button>
                    <Button onClick={this.stopCamera} selected={!cameraOn}>OFF</Button>
                </div>
                <div className="camera__ctImage">
                    <Loader style={{display: loader ? 'inline-block' : 'none'}} />
                    <img className="camera__image" src={image} style={{display: cameraOn ? 'inline-block' : 'none'}} />
                </div>
            </div>
        );
    }
}

export default Camera;
