import React from 'react';
import Button from '../../component/Button/Button'
import Loader from '../../component/Loader/Loader'
import MainModelController from '../../../model/controller/MainModelController';
import URLUtils from '../../../utils/URLUtils';

const Lights = () => {

    const listLights = MainModelController.model.lightCmds;
    const listItem = listLights.map((item, i) => {
        return (
            <div key={'itemlight' + i} className="lights__item">
                <h3 className="subtitle" >{item.name}</h3>
                <Button call={URLUtils.getUrlCmd(item.on.id)}>ON</Button>
                <Button call={URLUtils.getUrlCmd(item.off.id)}>OFF</Button>
            </div>
        );
    })

    return (
        <div className="lights">
            <h2 className="title" >Lumières</h2>
            {listItem}
        </div>);
};

export default Lights;
