import React from 'react';
import Button from '../../component/Button/Button'
import Loader from '../../component/Loader/Loader'

const Nav = () => (
    <div className="nav">
        <ul className="nav__CtItem">
            <li className="nav__item"><Button selected>Maison</Button></li>
            <li className="nav__item"><Button>Services</Button></li>
        </ul>
    </div>
);

export default Nav;
