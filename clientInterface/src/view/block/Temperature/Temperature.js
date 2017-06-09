import React from 'react';
import Button from '../../component/Button/Button'
import Loader from '../../component/Loader/Loader'
import MainModelController from '../../../model/controller/MainModelController';

const Temperature = () => (
    <div className="temperature">
        <h2 className="title" >Températures</h2>
        <p className="temperature__valueInt">{MainModelController.model.temperatureInt}</p>
        <p className="temperature__valueExt">{MainModelController.model.temperatureExt}</p>
    </div>
);

export default Temperature;
