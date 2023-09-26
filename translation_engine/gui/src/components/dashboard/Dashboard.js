import React from "react";

import './Dashboard.css';
import {Link} from "react-router-dom";

const Dashboard = () => {
    
    return (
        <div className="main-content">
            <h1 className="dashboard-headline">Dashboard</h1>
            <p className="message">Welcome to <strong>untertitle</strong>! <br/>
                To get started please examine the <Link to={"/jobs/"}>LIST</Link>
                &nbsp;of already created translation jobs or <Link to={"/upload/"}>UPLOAD</Link> another one.</p><br/>
        </div>

    )
}

export default Dashboard