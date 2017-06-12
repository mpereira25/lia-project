import React from 'react';
import Button from '../../component/Button/Button'
import Loader from '../../component/Loader/Loader'
import MainModelController from '../../../model/controller/MainModelController';
import URLUtils from '../../../utils/URLUtils';

const CustomCmds = () => {

    const customOnOffCmds = MainModelController.model.customOnOffCmds;
    const customCmds = MainModelController.model.customCmds;

    const listOnOffItem = customOnOffCmds.map((item, i) => {
        return (
            <div key={'itemCustomOnOff' + i} className="customCmds__itemOnOff">
                <h3 className="subtitle" >{item.name}</h3>
                <Button call={URLUtils.getUrlCmd(item.on.id)}>ON</Button>
                <Button call={URLUtils.getUrlCmd(item.off.id)}>OFF</Button>
            </div>
        );
    });

    const listItem = customCmds.map((item, i) => {
        return (
            <li key={'itemCustom' + i} className="customCmds__item">
                <Button call={URLUtils.getUrlCmd(item.id)}>{item.id.split('custom_')[1]}</Button>
            </li>
        );
    })

    return (
        <div className="customCmds">
            <h2 className="title" >Commandes perso</h2>
            {listOnOffItem}
            <ul className="customCmds__list">
                {listItem}
            </ul>
        </div>);
};

export default CustomCmds;
