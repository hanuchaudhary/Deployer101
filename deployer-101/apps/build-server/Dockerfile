FROM ubuntu:focal

RUN apt-get update
RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs
RUN apt-get install git -y

WORKDIR /home/app

COPY main.sh main.sh
COPY package*.json .
COPY script.js .
COPY certs /home/app/certs

RUN npm install

RUN chmod +x main.sh
RUN chmod +x script.js

ENTRYPOINT [ "/home/app/main.sh" ]
