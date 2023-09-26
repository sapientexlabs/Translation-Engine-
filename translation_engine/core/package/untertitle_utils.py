import datetime


def log(*args):
    print(datetime.datetime.now(), ' '.join(map(str, args)))
