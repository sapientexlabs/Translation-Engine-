CREATE TABLE schema_release (
    release_version VARCHAR(30) NOT NULL
);

CREATE TABLE job (
                     id INT AUTO_INCREMENT,
                     label VARCHAR(255),
                     source_language_id VARCHAR(2) NOT NULL,
                     target_language_id VARCHAR(2) NOT NULL,
                     created DATETIME,
                     completed DATETIME,
                     last_updated DATETIME,
                     overall_rating INT unsigned NOT NULL default 0,
                     job_state_id INT unsigned NOT NULL DEFAULT 10,
                     PRIMARY KEY(id)
);

CREATE TABLE job_state (
                           id INT,
                           label VARCHAR(200),
                           PRIMARY KEY(id)
);

CREATE TABLE job_file (
                          id INT AUTO_INCREMENT,
                          job_id INT unsigned NOT NULL,
                          label VARCHAR(200),
                          filename VARCHAR(400),
                          is_input_file TINYINT(1) NOT NULL DEFAULT 0,
                          PRIMARY KEY(id, job_id)
);

CREATE TABLE log (
                     id INT AUTO_INCREMENT,
                     title VARCHAR(200),
                     message VARCHAR(4000),
                     created DATETIME,
                     PRIMARY KEY(id)
);

CREATE TABLE job_segment (
                             id INT AUTO_INCREMENT,
                             job_id INT unsigned NOT NULL,
                             time_start INT unsigned,
                             time_duration INT unsigned,
                             caption VARCHAR(4000),
                             translation VARCHAR(4000),
                             PRIMARY KEY(id)
);

CREATE TABLE job_segment_user (
                                  id INT AUTO_INCREMENT,
                                  job_id INT unsigned NOT NULL,
                                  segment_id INT unsigned NOT NULL,
                                  user_caption VARCHAR(4000),
                                  priority INT,
                                  PRIMARY KEY(id)
);

CREATE TABLE language (
                          short VARCHAR(2) NOT NULL,
                          label VARCHAR(200),
                          PRIMARY KEY(short)
);

INSERT INTO language(short, label)
VALUES
('EN', 'ENGLISH'),
('TR', 'TURKISH'),
('IT', 'ITALIAN'),
('DE', 'GERMAN');

INSERT INTO job_state(id, label)
VALUES
(0, 'NO STATE'),
(10, 'JOB CREATED'),
(20, 'READY FOR PROCESSING'),
(30, 'PROCESSING'),
(31, 'EXTRACTING AUDIO'),
(32, 'SPLITTING AUDIO INTO SEGMENTS'),
(33, 'EXTRACTING TEXT'),
(34, 'TRANSLATING TEXT'),
(35, 'GENERATING SRT'),
(36, 'EMBEDDING SUBTITLES'),
(40, 'FINISHED'),
(50, 'ERROR'),
(60, 'DELETED');


-- ---------------------------------------------------------
-- track version
INSERT INTO schema_release(release_version) VALUES ('1.04');


-- ---------------------------------------------------------
-- initial test data
INSERT INTO job(label,
                source_language_id,
                target_language_id,
                created, completed,
                last_updated,
                overall_rating,
                job_state_id)
VALUES
('Testjob A', 'EN', 'TR', NOW(), '2099-01-01 23:59:59', NOW(), 0, 20),
('Testjob B', 'EN', 'IT', NOW(), '2099-01-01 23:59:59', NOW(), 0, 10),
('Testjob C', 'TR', 'EN', NOW(), '2099-01-01 23:59:59', NOW(), 0, 10),
('Testjob D', 'EN', 'DE', NOW(), '2099-01-01 23:59:59', NOW(), 0, 10);

INSERT INTO job_file(job_id, label, filename, is_input_file)
VALUES (1, 'Test Input File', 'untertitle_job_1_in.mp4', 1);