import datetime
import mariadb
from ..untertitle_utils import log
from .. import untertitle_settings

__all__ = ['DbConnector']


class DbConnector:

    def __init__(self):
        log("dbconnector initialized")
        self._connection = mariadb.connect(
            user="ut",
            password="ut",
            host="untertitle-db" if untertitle_settings.DEV is not True else "localhost",
            port=3306 if untertitle_settings.DEV is not True else 7002,
            database="untertitle_db",
            autocommit=True
        )
        self._cursor = self._connection.cursor(dictionary=True)

    def __exit__(self):
        self.connection.close()

    @property
    def connection(self):
        return self._connection

    @property
    def cursor(self):
        return self._cursor

    def execute(self, statement, params=None, commit=True):
        try:
            self.cursor.execute(statement, params or ())
        except mariadb.Error as e:
            log(f"DB-Error: {e}")
            return []
        if commit:
            self.connection.commit()
        return self.cursor.rowcount

    def execute_and_fetch(self, statement, params=None):
        self.execute(statement, params, False)
        return self.cursor.fetchall()

    def show_tables(self):
        return self.execute_and_fetch("SHOW TABLES")

    def get_jobs(self):
        return self.execute_and_fetch("SELECT * FROM job")

    def get_jobs_by_state(self, job_state):
        return self.execute_and_fetch("SELECT * FROM job WHERE job_state_id = ?", [job_state])

    def get_job(self, job_id):
        return self.execute_and_fetch("SELECT * FROM job WHERE id = ?", [job_id])

    def touch_job(self, job_id):
        return self.execute("UPDATE job SET last_updated = ? WHERE id = ?", [self.create_timestamp(), job_id])

    def set_job_state(self, job_id, state_id):
        log('setting job state to', state_id)
        return self.execute("UPDATE job SET job_state_id = ?, last_updated = ? WHERE id = ?",
                            [state_id, self.create_timestamp(), job_id])

    def insert_job_file(self, job_id, label, file_name):
        rowcount = self.execute("INSERT INTO job_file(job_id, label, filename) VALUES (?, ?, ?)",
                            [job_id, label, file_name])
        return self.cursor.lastrowid if rowcount > 0 else None

    def get_files_for_job(self, job_id):
        return self.execute_and_fetch("SELECT * FROM job_file WHERE job_id = ?", [job_id])

    def get_segments_for_job(self, job_id):
        return self.execute_and_fetch("SELECT * FROM job_segment WHERE job_id = ?", [job_id])

    def get_user_segments_for_job(self, job_id):
        return self.execute_and_fetch("SELECT * FROM job_segment_user WHERE job_id = ?", [job_id])

    def add_segment_for_job(self, job_id, time_start, time_duration, caption, translation):
        rowcount = self.execute("INSERT INTO job_segment(job_id, time_start, time_duration, caption, translation) VALUES (?, ?, ?, ?, ?)",
                                [job_id, time_start, time_duration, caption, translation])
        return self.cursor.lastrowid if rowcount > 0 else None

    def create_timestamp(self):
        now = datetime.datetime.now()
        return now.strftime('%Y-%m-%d %H:%M:%S')
