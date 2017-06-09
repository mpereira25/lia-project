import React from 'react';
import Button from '../../component/Button/Button'
import Loader from '../../component/Loader/Loader'
import URLUtils from '../../../utils/URLUtils';

const Volume = () => (
    <div className="volume">
        <h2 className="title" >Volume</h2>
        <div className="volume__ctBtn">
            <Button call={URLUtils.getUrlCmd('volume_down')}>-</Button>
            <Button call={URLUtils.getUrlCmd('volume_up')}>+</Button>
        </div>
    </div>
);

export default Volume;
