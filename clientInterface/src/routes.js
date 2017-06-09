import React from 'react';
import { Link, Route, IndexRoute } from 'react-router';
import Header from './view/block/Header/Header';
import Nav from './view/block/Nav/Nav';
import Temperature from './view/block/Temperature/Temperature';
import Lights from './view/block/Lights/Lights';
import Volume from './view/block/Volume/Volume';
import Camera from './view/block/Camera/Camera';

const Home = () => (
    <div>
        <Header />
        <Nav />
        <Volume />
        <Temperature />
        <Lights />
        <Camera />
    </div>
)


export default (
    <Route path="/">
        <IndexRoute component={Home}/>
        <Route path="/home" component={Home}/>
    </Route>
)
