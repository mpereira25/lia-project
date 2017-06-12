import React from 'react';
import Button from '../../component/Button/Button'
import Loader from '../../component/Loader/Loader'
import MainModelController from '../../../model/controller/MainModelController';

class Temperature extends React.Component {

    constructor(props){
        super(props);
        this.state =  {
            ext: MainModelController.model.temperatureExt,
            int: MainModelController.model.temperatureInt,
            loader: false,
        }
    }

    refreshTemperatures() {
        this.setState({
            loader: true
        });
        MainModelController.getTemperatures().then((result) => {
            this.setState({
                loader: false,
                ext: MainModelController.model.temperatureExt,
                int: MainModelController.model.temperatureInt,
            });
        }).catch(() => {
            this.setState({
                loader: false
            });
        });
    }

    render() {
        const { int, ext, loader } = this.state;
        const onClick = () => {
            this.refreshTemperatures();
        }
        return (<div className="temperature">
                <h2 className="title" >Températures</h2>
                <div className="temperature__ctValue"
                    style={{display: !loader ? 'inline-block' : 'none'}}
                    onClick={onClick}
                >
                    <p className="temperature__valueInt">{int}</p>
                    <p className="temperature__labelValue">Int</p>
                </div>
                <div className="temperature__ctValue"
                    style={{display: !loader ? 'inline-block' : 'none'}}
                >
                    <p className="temperature__valueExt">{ext}</p>
                    <p className="temperature__labelValue">Ext</p>
                </div>
                <Loader style={{display: loader ? 'inline-block' : 'none'}} />
        </div>);
    }

}

export default Temperature;
