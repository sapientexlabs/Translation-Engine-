import React from "react";
import {Link} from "react-router-dom";

import './header.css';

const Header = () => {
    
    return (
         <div class="header">
            <a href="/" class="logo" style={{paddingLeft: '3.2%'}}>UNTERTITLE</a>
            <div class="header-right">
                <Link to="/">Dashboard</Link>
                <Link to="/jobs">Joblist</Link>
                <Link to="/upload">Job Upload</Link>
            </div>
        </div> 
    )
}

export default Header