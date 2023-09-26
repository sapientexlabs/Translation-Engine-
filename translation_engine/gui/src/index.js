import React from 'react';
import ReactDOM from 'react-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";
import JobList from "./components/joblist/JobList";
import JobUpload from "./components/jobupload/JobUpload";
import Dashboard from "./components/dashboard/Dashboard";
import JobDetails from "./components/jobdetails/JobDetails";
import { BrowserRouter as Router, Route } from "react-router-dom";

import './index.css';

const App = () => {

    return (
        <Router>
            <Header />
            <Route exact path="/" component={Dashboard} />
            <Route path="/jobs" component={JobList} />
            <Route path="/upload" component={JobUpload} />
            <Route path="/job/:jobid" component={JobDetails} />
            <Footer />
        </Router>
    )
}

ReactDOM.render(<App />, document.getElementById('root'))
