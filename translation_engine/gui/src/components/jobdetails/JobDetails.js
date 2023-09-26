import React from "react";
import JobRating from "./job-rating/JobRating";
import UntertitlePlayer from "./untertitle-player/UntertitlePlayer";

import './JobDetails.css';

const JOB_DETAIL_URL = 'http://localhost:7001/job';

class JobDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            jobId: props.match.params.jobid,
            updating: false
        };
    }

    render() {

        return (
            <div class="main-content">
                <h1 className="joblist-headline">Joblist <b>{ this.state.updating ? 'updating' : '' }</b></h1>
                <h5>Job ID {this.state.id} - {this.state.label}</h5>
                <h5>Job State: {this.state.job_state_text}</h5>
                <ul>
                    <li>Source Language: {this.state.source_language_id}</li>
                    <li>Target Language: {this.state.target_language_id}</li>
                    <li>Created: {this.state?.created?.substring(0,19)}</li>
                    <li>Last Update: {this.state?.last_updated?.substring(0,19)}</li>
                    <li>
                        {this.state.overall_rating >= 0 &&
                        <JobRating overall_rating={this.state?.overall_rating}
                                   job_state_text={this.state?.job_state_text} job_id={this.state.id}/>
                        }
                    </li>
                    <li>Files: {this.state?.files?.length}
                        <ul>
                            {this.state?.files?.map(file => {
                                return (
                                    <h5>{file.label} - {file.filename}</h5>
                                );
                            })}
                        </ul>
                    </li>
                    <li>Segments: {this.state?.segments?.length}</li>
                    <li>User Segments: {this.state?.userSegments?.length}</li>
                </ul>
                <hr/>
                {   this.state?.segments && this.state?.inputFile &&
                    <UntertitlePlayer videofile={this.state?.inputFile} segments={this.state?.segments}/>
                }
            </div>
        );
    }


    fetchData() {
        this.setState({updating: true})
        fetch(JOB_DETAIL_URL + "/" + this.state.jobId)
            .then((response) => response.json())
            .then(jobDetailData => {
                this.updateFromData(jobDetailData);
            });
    }

    updateFromData(jobDetailData) {
        // filter input file
        let inputFile;
        if (jobDetailData.data.files) {
            for (let file of jobDetailData.data.files) {
                if (file.is_input_file === 1) {
                    inputFile = "/untertitle-media/"+this.state.jobId+"/"+file.filename;
                    break;
                }
            }
        }
        this.setState({
            updating: false,
            ...jobDetailData.data,
            inputFile: inputFile
        })
    }

    componentDidMount() {
        this.fetchData();
    }
}

export default JobDetails