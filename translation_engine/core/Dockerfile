FROM python:3
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get install -y cron libmariadb3 libmariadb-dev
RUN python -m pip install --upgrade pip
RUN touch /var/log/untertitle.log
RUN mkdir /app
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
ENV PYTHONUNBUFFERED 1
CMD ["python", "/app/untertitle.py"]