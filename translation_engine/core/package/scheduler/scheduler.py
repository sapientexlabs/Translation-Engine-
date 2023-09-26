from ..db_connector import db_connector
from ..job_processor import job_processor
from ..untertitle_utils import log

__all__ = ['Scheduler']


class Scheduler:
    def __init__(self):
        log('scheduler initialized')
        self.dbc = db_connector.DbConnector()

    def check_jobs(self):
        log('scheduler checking jobs')
        jobs = self.dbc.get_jobs_by_state(job_processor.JobState.READY_FOR_PROCESSING.value)
        log('found', len(jobs), 'jobs with state', job_processor.JobState.READY_FOR_PROCESSING)
        for job in jobs:
            jp = job_processor.JobProcessor(job['id'])
            jp.run()
        # fetch jobs from database
        # iterate and trigger processing for each job
        return True
