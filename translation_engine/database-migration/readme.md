# DB Migration

## 1. Introduction
This folder contains separate folders for each iteration/release with release and rollback sql statements.
The initial release will create the __schema_release__ database table, which is used for keeping track of the currently deployed schema version.

Each release should consist of a folder named after the proper version, 
containing a __release.sql__ and a __rollback.sql__ file. 
Each of these files must contain the necessary statements for the schema 
change and also include __logging__ to the __schema_release__ table. 


## 2. How-To
Before applying a specific release, make sure to verify the current state by querying the release table in the database.

__Example:__
```sql
-- fetch current version
SELECT target_version FROM untertitle_db.schema_release ORDER BY applied DESC LIMIT 1;
```

### 2.1 Release
Apply the file(s) in ascending order, starting with the next release after the one currently deployed.

```
mysql -u ut -p untertitle_db < release.sql
```

### 2.2 Rollback
Rollback each release separately, starting with the currently deployed version.

```
mysql -u ut -p untertitle_db < release-XXX/rollback.sql
```

#### Note:
A script will be available in the future for a more convenient handling of releases/rollbacks.


## 3. Entity Relationship Model

```mermaid
erDiagram

    JOB {
        int_unique_pk id
        string label
        int_fk source_language_id
        int_fk target_language_id
        datetime created
        datetime completed
        datetime last_updated
        int overall_rating
        int_fk state_id
    }

    JOB_STATE {
        string id
        string label
    }

    JOB_FILE {
        int_unique_pk id
        string path
        string label
        string format
        int_fk job_id
    }

    LOG {
        int_unique_pk id
        string title
        string message
        datetime created
    }    
    
    JOB_SEGMENT {
        int_unique_pk id
        int_fk job_id 
        int time_start
        int time_duration
        string caption
    }
    
    JOB_SEGMENT_USER {
        int_unique_pk id
        int_fk job_id 
        int_fk segment_id
        string user_caption
        int priority
    }    
    
    LANGUAGE {
        int_unique_pk id
        string label
    }
    
    SCHEMA_RELEASE {
        int_unique_pk id
        int target_version
        int source_version
        datetime applied
    }


    JOB o{..|| JOB_STATE : "is in exactly one"
    JOB_SEGMENT }o..|| JOB : "is created for"
    JOB_SEGMENT ||..}o JOB_SEGMENT_USER : "overrides"
    JOB_FILE }o..|| JOB : "belongs to one"
    JOB |{..}| LANGUAGE : "is configured by"

```

## 4. Release Notes

### release-001
Create __schema-release__ table and its first entry.

### release-002
Setup complete table structure

### release-003
Fill language and state tables
