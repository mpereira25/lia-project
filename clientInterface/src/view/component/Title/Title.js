import React from 'react';

const Title = ({ className}) => (
    <h2 className={'title' + (className ? (' ' + className) : '')}>
        test
    </h2>
);

export default Title;
