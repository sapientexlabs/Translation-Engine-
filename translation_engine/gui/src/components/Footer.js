import React from "react";

import '../index.css';

class Footer extends React.Component {

    state = {
        apiResponse: 0,
        schemaVersion: -1
    }

    componentDidMount() {
        console.log("footer mount")
        const apiTest = 'http://localhost:7001/schema/version'
        fetch(apiTest)
        .then((response) => response.json())
        .then(data => {
            this.setState({
                apiResponse: data.status,
                releaseVersion: data.data.release_version
            });
        })
    }

    render() {
        console.log("footer render")
        return (
            <div class="footerContainer paddingClass">
                <div class="name" style={{paddingLeft: '6.2%'}}>UNTERTITLE</div>
                <div class="api">API status: {this.state.apiResponse}</div>
                <div class="schema">Schema version: {this.state.releaseVersion}</div>
            </div>
        )
    }
}

export default Footer