import React from 'react';
import http from 'http';

const Button = ({ className, onClick = null, children, call = null, selected = false}) => {

    const _onClick = () => {
        if(call) {
            http.get(call);
        }
        if(onClick) {
            onClick();
        }
    }

    return (
        <button className={'btn btn-primary' + (className ? (' ' + className) : '') + (selected ? ' btn-primary_selected' : '')} onClick={_onClick}>
            {children}
        </button>)
};

export default Button;
