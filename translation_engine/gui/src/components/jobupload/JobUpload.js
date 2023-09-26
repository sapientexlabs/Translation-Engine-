import React from "react";

import './JobUpload.css';

const JobUpload = (props) => {
    
    return (
        <form class="jobupload-form" action="http://localhost:7001/job" method="POST" encType="multipart/form-data">
            <h1 class="jobupload-headline">Job Upload</h1>
            <div class="jobUploadContainer">
                <div class="source">
                    <div  class="jobupload-field">
                        <label>Target Language</label>
                        <select name="targetlanguage" id="targetlanguage">
                            <option value="EN">English</option>
                            <option value="DE">German</option>
                            <option value="IT" selected>Italian</option>
                            <option value="TR">Turkish</option>
                        </select>
                    </div>
                </div>
                <div class="target">
                    <div class="jobupload-field">
                        <label>Source Language</label>
                        <select name="sourcelanguage" id="sourcelanguage">
                            <option value="EN" selected>English</option>
                            <option value="DE">German</option>
                            <option value="IT">Italian</option>
                            <option value="TR">Turkish</option>
                        </select>
                    </div>
                </div>
                <div class="browse">
                    <div class="jobupload-field">
                        <label>Video File</label>
                        <input type="file" 
                            id="file" name="file"
                            accept="video/mp4,video/x-m4v,video/*"
                        />
                        <p><strong>Only mp4 video files are supported at the moment!</strong></p>
                    </div>
                </div>
                <div class="upload"><input type="submit" value="   Upload and create Job!   "></input></div>
            </div>
        </form>
    )
}

export default JobUpload