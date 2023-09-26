from time import sleep
from package.scheduler import scheduler
from package import untertitle_settings
import sys

untertitle_settings.DEV = len(sys.argv) > 1

s = scheduler.Scheduler()


def check_jobs():
    s.check_jobs()
    sleep(20)
    check_jobs()


check_jobs()
