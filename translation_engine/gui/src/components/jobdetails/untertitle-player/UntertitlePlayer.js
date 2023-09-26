import React from "react";

import './UntertitlePlayer.css';

class UntertitlePlayer extends React.Component {
    constructor(props) {
        console.log(props);
        super(props);
    }

    render() {
        return (
            <div>
                <video id="vid-player" width="320" height="240" controls>
                    <source src={this.props.videofile} type="video/mp4" />
                </video>
                <textarea id="vid-caption-box" name="vid-caption-box" rows="5" cols="50" />
            </div>
        )
    }

    componentDidMount() {
        const ve = document.getElementById('vid-player');
        ve.addEventListener('timeupdate', (event) => {
            this.updateCaption(ve.currentTime)
        });
    }

    updateCaption(currentTime) {
        console.log("vid update " + currentTime);
        let selectedSegment = null;
        // find first matching element
        this.props?.segments.forEach( (element) => {
            if(currentTime * 1000 > element.time_start) {
                selectedSegment = element;
            }
        });
        // update textbox
        if(selectedSegment) {
            const captionbox = document.getElementById('vid-caption-box');
            captionbox.value = selectedSegment.translation;
        }
    }
}

export default UntertitlePlayer