FROM oven/bun:1.1-debian

WORKDIR /app
# Make bash colored
RUN cp /etc/skel/.bashrc /root/.bashrc
RUN apt update && apt install -y git nano

COPY package.json .
COPY bun.lockb .
RUN bun install

COPY . .
