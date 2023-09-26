Feature: User can access the Untertitle tool
  The app is operational, online, and it allows the user to interact with the video uploader

  Scenario: User loads Untertitle tool
    Given User loads an instance of Untertitle tool
    When the app finishes loading
    Then it displays the overview screen

  Scenario: User tries loading Untertitle tool when it's already running
    Given an image of the container is already running
    When User loads another one
    Then the new container and the new Untertitle instance has no relation to any other one
    And the Untertitle instance does not share any resources or data with any other

  Scenario: User or OS puts Untertitle tool in the background/minimizes it
    Given an Untertitle instance is running
    When User or OS minimize it
    Then all processes are continued if possible and the cache is not deleted and all data is preserved

  Scenario: User or OS shuts down Untertitle tool with a finished job
    Given Untertitle is running with at least one completed caption job
    When User or OS shuts down the app instance
    Then all files are deleted and any captions which have not been downloaded will not be recoverable

  Scenario: User visits website
    Given the user's device has access to the internet
    When the user browses to the Untertitle's URL
    Then the website loads succesfully
    And the website shows a form for video upload and translation

Feature: User can upload their videos to Untertitle tool when less than 10 minutes long

  Scenario: User accesses the uploader screen
    Given User is on the overview screen
    When User clicks on upload button
    Then Untertitle displays uploader screen

  Scenario: User navigates back to the overview screen from uploader
    Given User is on the uploader screen
    When User clicks on the back to overview button
    Then Untertitle displays the overview screen

  Scenario: User drags&drops video file onto the uploader screen
    Given User is on the uploader screen
    When User drags & drops the icon of a supported video file onto the screen
    Then Untertitle selects the file for upload

  Scenario: User clicks the browse button in the uploader screen
    Given User is on the uploader screen
    When User clicks the browse button/select video button
    Then Untertitle opens a file system window that allows the selection of a supported file

  Scenario: User tries to upload a video that goes above the time limit
    Given User is uploading a supported video file with any given method
    When the file brings the cumulative uploaded video content to over 10 minutes
    Then the file is not uploaded
    And Untertitle displays a toast popover with a message explaining it exceeds the time limit

  Scenario: User starts a translation job
    Given User has selected a video file, as well as the source and target captioning language
    When User clicks the upload button
    Then Untertitle tries uploading video file
    And Untertitle starts captioning job
    And Untertitle displays the overview screen

  Scenario: User selects source language for captioning job
    Given User is on uploader screen
    When User clicks on source language dropdown menu
    Then User can select one of the supported source languages that correspond to the speech in the video

  Scenario: User selects target language for captioning job
    Given User is on uploader screen
    When User clicks on target language dropdown menu
    Then User can select one of the supported languages for the captions of the selected video

Feature: Untertitle adds captions and translations to content uploaded by User

  Scenario: Untertitle lists current videos being captioned in overview screen
    Given User is on overview screen
    When User has uploaded at least one video
    Then Untertitle shows a list item for each video which has been uploaded
    And the list item includes progress status, video title, and buttons to delete, review, or download, as well as a caption quality rating form

  Scenario: User submits general feedback to translation job
    Given a video in the list of the overview screen has a completed status
    When User selects a star rating for the captioning job
    Then Untertitle saves rating on its work for further elaboration

  Scenario: User deletes a video from the overview screen
    Given User is on overview screen
    When User clicks on delete button in list item of a processed video
    Then Untertitle permanently removes the video and all associated files from its processing

Feature: User can edit the captions/translations made on their uploaded content

  Scenario: User loads review screen
    Given User is on the overview screen
    When User clicks the review button of a processed video
    Then the review screen for the corresponding video is displayed
    And the review screen contains a video player for the video
    And the review screen also contains an area with the captions

  Scenario: Untertitle highlights the captions relative to the current timestamp
    Given User is on the review screen
    When the video is playing in the video player
    Then the captions relative to that timestamp are highlighted in the caption text section of the page

  Scenario: User edits captions
    Given User is on the review screen
    When User clicks on a text element for a timestamp
    Then the text element becomes an editable textbox
    And the user can edit the text at the selected timestamp

  Scenario: User cancels caption edits
    Given the captions of a timestamp are being edited in the review screen
    When User clicks outside the textbox
    Then all the edits are cancelled
    And the text at that timestamp is reverted to the previous saved version

  Scenario: User submits edits to translation job
    Given the captions of a timestamp are being edited in the review screen
    When User clicks the save edits button by the textbox
    Then the edits are saved as part of the captions for that video

  Scenario: User leaves review screen
    Given User is on the review screen
    When User clicks the back button or the done button
    Then the overview screen is displayed

Feature: User can save to local storage the processed content and its captions/translations

  Scenario: Untertitle displays files available to download
    Given User is on the overview screen
    When User clicks the download button of a video list item
    Then Untertitle displays the download screen
    And the download screen contains a list of all available files for that video, including captions and audio-visual content in a variety of suitable formats

  Scenario: User selects which files they want to download
    Given User is on the download screen
    When the user checks a file from the file checklist
    Then the file will be among the files to be downloaded at the moment of download
    And the file will not download if unchecked

  Scenario: User saves one or more files to local storage
    Given at least one file is selected in the file download list
    When User clicks the download button
    Then a file system browser opens to allow User to choose the directory in which to save the selected files
    And Untertitle exports and saves the files to the chosen directory


