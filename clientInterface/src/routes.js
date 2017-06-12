import React from 'react';
import { Link, Route, IndexRoute } from 'react-router';
import Header from './view/block/Header/Header';
import Nav from './view/block/Nav/Nav';
import Temperature from './view/block/Temperature/Temperature';
import Lights from './view/block/Lights/Lights';
import Controls from './view/block/Controls/Controls';
import Camera from './view/block/Camera/Camera';
import CustomCmds from './view/block/CustomCmds/CustomCmds';

const Home = () => (
    <div>
        <Header />
        <Nav />
        <Controls />
        <Temperature />
        <Lights />
        <Camera />
        <CustomCmds />
    </div>
)


export default (
    <Route path="/">
        <IndexRoute component={Home}/>
        <Route path="/home" component={Home}/>
    </Route>
)
