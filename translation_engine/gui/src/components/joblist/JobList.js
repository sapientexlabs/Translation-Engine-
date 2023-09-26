import React from "react";
import {Link} from "react-router-dom";

import './JobList.css';

const JobTableHeader = () => {
    
    return (
        <tr>
            <th>Id</th>
            <th>Label</th>
            <th>Rating</th>
            <th>Source</th>
            <th>Target</th>
            <th>Created</th>
            <th>Last Updated</th>
            <th>State</th>
            <th>Actions</th>
        </tr>

    )
};

const JobTableRow = ({ job }) => {
    if (!job.id) return <div />;
    return (
        <tr>
            <td>
                <Link to={"/job/" + job.id}>Job {job.id}</Link>
            </td>
            <td>
                <Link to={"/job/" + job.id}>{job.label}</Link>
            </td>
            <td>
                <p>{job.overall_rating}</p>
            </td>
            <td>
                <p>{job.source_language_id}</p>
            </td>
            <td>
                <p>{job.target_language_id}</p>
            </td>
            <td>
                <p>{job.created.substring(0, 19)}</p>
            </td>
            <td>
                <p>{job.last_updated.substring(0, 19)}</p>
            </td>
            <td>
                <p>{job.job_state_text}</p>
            </td>
            <td>
                <button type="button" disabled="true">Reprocess</button>
                <button type="button" disabled="true">Rate</button>
            </td>
        </tr>
    );
};

const JobTable = (props) => {
    return (
        <div className="job-list-container">
            <table>
                <JobTableHeader />
                <tbody>
                    {props.data.map((job, key) => {
                        return (
                            <JobTableRow job={job} key={key} />
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
};

const JOB_LIST_URL = 'http://localhost:7001/jobs';

class JobList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            updating: false,
            jobs: []
        };
        this.updateInterval = 10000;
    }

    render() {
        return (
            <div class="main-content">
                <h1 className="joblist-headline">Joblist <b>{ this.state.updating ? 'updating' : '' }</b></h1>
                <JobTable data={this.state.jobs} isFetching={this.state.updating} />
            </div>
        );
    }

    fetchData() {
        this.setState({updating: true})
        fetch(JOB_LIST_URL)
            .then((response) => response.json())
            .then(jobsResponse => {
                this.updateFromData(jobsResponse);
            });
    }

    updateFromData(jobsResponse) {
        this.setState({
            updating: false,
            jobs: jobsResponse.data
        })
        console.log(this.state);
    }

    componentDidMount() {
        this.timerId = setInterval(
            () => this.fetchData(),
            this.updateInterval
        );
        this.fetchData();
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

}

export default JobList