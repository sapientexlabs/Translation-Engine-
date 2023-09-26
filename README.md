# UNTERTITLE

## 1. Introduction

### 1.1 Installation

#### Requirements

* Docker installed (and running)
* Browser

#### Startup

* Start Docker on your system and wait for it to initialize
* Change to the top level directory of the application, then create and start all containers with `docker-compose up`
* Wait until all containers have started up
* Access application at __localhost:7000__


## 2. Architecture

* Multiple Docker container, orchestrated via docker-compose


### 2.1 Components

#### 2.1.1 GUI
#### 2.1.2 Rest API
#### 2.1.3 Database
#### 2.1.4 Core


### 2.2 Shared Infrastructure

* Docker Volume

### 2.3 Overview

#### Overview Diagram

```mermaid
graph TB

subgraph Database Module
    dbms(Relational SQL Database - Maria DB)
end

subgraph API Module
    rest(REST API) --> dbms
end

subgraph GUI Module
    uploader(Upload Screen) --> overview(Overview Screen)
    downloader(Download Screen) --> overview
    review(Review Screen) --> overview
    overview --> client(REST Client)
end

subgraph Core Module
    jobproc(Job Processor) --> splitter(Audio Splitter)
    splitter --> speech2text
    speech2text(Speech to Text Converter) --> Translator
    Translator --> generator(Speech Generator)
    generator --> composer(Video Composer)
    jobproc --> dbms
end

client --> rest(Rest API)
Scheduler --> dbms
Scheduler --> jobproc
```

#### Class diagram

```mermaid
classDiagram

    AudioSplitter <|-- SpeechToTextConverter
    SpeechToTextConverter <|-- Translator
    Translator <|-- SpeechGenerator
    SpeechGenerator <|-- VideoComposer
    RestClient <|-- RESTAPI

    class AudioSplitter {
        +generateAudioChunks(bytes[] video) : List audioChunks
    }

    class SpeechToTextConverter {
        +extractText(bytes[] audioChunk) : String extract 
    }

    class Translator {
        +translateText(String sourceText, String languageCode) : String translatedText
    }

    class SpeechGenerator {
        +generateSpeechAudio(String text) : bytes[] audiofile
    }

    class VideoComposer {
        +createVideo(bytes[] video, String[] captions, ?Data audioTrack)
        -insertCaptions(Data video, String[] captions)
        -insertAudioTrack(Data audioTrack, Data video)
    }

    class JobProcessor {
        +processJob(int jobId)
    }

    TargetLanguageEnum  <--> UploaderView
    SourceLanguageEnum  <--> UploaderView

    class TargetLanguageEnum {
        +supportedLanguages
    }
    
    class SourceLanguageEnum {
        +supportedLanguages
    }
    class UploaderView {
        -renderView()
        +selectFileToUpload()
        +selectTargetLanguage()
        +selectSourceLanguage()
        +upload()

        -String SelectedFilePath
        -TargetLanguageEnum targetLanguage
        -SourceLanguageEnum sourceLanguage
    }

    class DownloaderView {
        -renderView()
        +selectFilesToDownload()
        +selectDownloadDirectory()
        +download()

        -String[] selectedFiles
        -String downloadPath
    }

    class OverviewView {
        -renderView()
    }

    class ReviewView {
        -backToOverview()
        -renderView()
        -makeTimestampEditable()
        -saveEdits()
        -String currentTimestampSeconds
    }

    class RESTClient {
    }

    class RESTAPI {
        +getJobs()
        +getJob(* jobId)
        +createJob(* jobData)
        +updateJob(* jobData)
        +deleteJob(* jobId)
        +addSegmentFeedback(* segmentId, * feedbackData)        
    }

    RestClient ..|> RestAPI

    class DatabaseController {
        // exposes er model
    }


```

### 2.4 Sequences / Communication

#### FRONT END Sequence

```mermaid
sequenceDiagram
    User-->>+ Uploader Screen: Selects files to caption 
    User->> Uploader Screen: Bye
    Uploader Screen ->> User: Hello
    Uploader Screen ->>- User: Hello
    User ->> Overview Screen : hi
    User ->> Review Screen : hi
    User ->> Downloader Screen : hi
    Uploader Screen ->> Core API : hi
```
#### BACK END Sequence

```mermaid
sequenceDiagram
    Core API Server->> Database: Selects files to caption 
    User->> Uploader Screen: Bye
    OverviewScreen ->> User: Hello
    Uploader Screen ->> User: Hello

```

```mermaid
sequenceDiagram
    User-->>+ Uploader Screen: Selects files to caption 
    User->> Uploader Screen: Bye
    Uploader Screen ->> User: Hello
    Uploader Screen ->>- User: Hello
    John-->>Alice: Great!
    Alice-)John: See you later!
```

## 3. Project Plan

```mermaid
gantt
    dateFormat  MM-DD
    axisFormat %b-%d
    title Untertitle Development Timeline

    section Documentation
    Definition of Project and Scope            : done,    doc1, 05-10, 14d
    Definition of Unique Selling Point : done, doc2, after doc1, 7d
    v0.0 Wireframes/low fidelity : done,crit, doc10, after doc2, 7d
    Choosing Stack/Architecture : done, doc4, after doc3, 7d
    Project Proposal :crit, doc5, 07-05, 7d
    Evaluate Proposal Feedback :crit, doc9, after doc5, 14d
    Report Submission :crit, doc1000, after prod1000, 7d

    section Production
    v0.1 Feasibility Test/Prototype :done, crit, doc3, after doc10, 14d
    v0.2 Finalize Multi-Container Architecture :done, prod1, after doc4, 7d
    v0.3 GUI Screens in React (non-operational like mockup) : done, crit, prod90, after prod1, 14d
    User can upload video: done, prod15, after prod90, 14d
    Process uploaded content for target language: done, prod16, after prod15, 7d
    User can see and manage jobs: done, prod17, after prod16, 7d
    User can give feedback: done, prod18, after prod17, 7d    
    Reprocess jobs on new translation: done, prod20, after prod18, 7d
    User can download files : done, prod2, after prod20, 4d
    Replace external APIs with custom modules *optional* : active, prod3, after prod16, 21d
    v1.0    :crit, prod1000, 09-05, 7d
  
    section Testing
    Features Poll : done,  test8, after doc1, 7d
    v0.1 Prototype User Testing/Feedback: done, crit, test9, after doc3,2d
    App name poll : done,  test10, after test9, 3d
    GUI User testing/rating UX : crit, done, test11, after test10, 7d
    Test Case upload video: done, test1, after test11, 7d
    Test Case process video for target language: done, test2, after test1, 4d
    Test Case manage jobs: done, test3, after test2, 4d
    Test Case give feedback: done, test4, after test3, 10d
    Test Case edit translation: active, test5, after test4, 4d
    Test Case reprocess on new translation: active, test6, after test5, 4d
    Test Case download files: done, test7, after test6, 10d
    User end to end testing: done, test8, after test7, 21d

    section Delivery
    Submission Deadline: crit, active, submit1, 09-16, 1d


```

## 4. References and resources

# Teamwork repository
https://github.com/shiftbit/cm2020-agil-t1g0-xqr

# Project Proposal
https://www.dropbox.com/scl/fi/bfh3obt78t8tj5aqqitma/cm2020-agil-t1g0-xqr.paper?dl=0&rlkey=b9n3j1h6gyypen7pqxlzb4zv8

# Final paper
https://www.dropbox.com/scl/fi/utpnar7woulw669mq15sp/Agile-Final-Assessment.paper?dl=0&rlkey=ird2whtbsjnw2evz37294iich
