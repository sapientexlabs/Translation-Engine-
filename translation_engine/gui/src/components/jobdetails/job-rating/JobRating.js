import React from "react";

import './JobRating.css';

export class JobRating extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setState({overall_rating: 0});
    }

    handleSubmit(event) {
        event.preventDefault();
        const ratingValue = document.getElementById('job-rating')?.value;
        if (ratingValue && ratingValue > 0 && ratingValue < 5) {
            this.sendRating(ratingValue);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({overall_rating: this.props.overall_rating})
    }

    async sendRating(ratingValue) {
        const url = "http://localhost:7001/job/" + this.props.job_id + "/rating";
        const requestProps = {
            'rating': ratingValue
        };
        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(requestProps)
        })
            .then((response) => response.json())
            .then(() => {
                    this.setState({overall_rating: ratingValue})
                }
            )
            .catch(e => {
                console.log(e)
            })

    }

    render() {
        if (this.props.job_state_text === "FINISHED" && this?.state?.overall_rating === 0) {
            return (
                <form className="jobrating-jobdetails" onSubmit={this.handleSubmit}>
                    <label htmlFor="rating">Rate Job:</label>
                    <input type='number' id='job-rating' name='job-rating' min="1" max="5"/>
                    <button type="submit">Submit</button>
                </form>
            );
        } else {
            return (
                <span>Overall Rating: {this?.state?.overall_rating}</span>
            );
        }
    }
}

export default JobRating