import React from 'react';
import Button from '../../component/Button/Button'
import Loader from '../../component/Loader/Loader'
import URLUtils from '../../../utils/URLUtils';

const Controls = () => (
    <div className="controls">
        <h2 className="title" >Controls</h2>
        <div className="controls__ctBtn">
            <Button call={URLUtils.getUrlCmd('wakeup')}>Wakup</Button>
            <Button call={URLUtils.getUrlCmd('prev')}>Prev</Button>
            <Button call={URLUtils.getUrlCmd('stop')}>Stop</Button>
            <Button call={URLUtils.getUrlCmd('resume')}>Play</Button>
            <Button call={URLUtils.getUrlCmd('pause')}>Pause</Button>
            <Button call={URLUtils.getUrlCmd('next')}>Next</Button>
            <Button call={URLUtils.getUrlCmd('volume_down')}>-</Button>
            <Button call={URLUtils.getUrlCmd('volume_up')}>+</Button>
        </div>
    </div>
);

export default Controls;
