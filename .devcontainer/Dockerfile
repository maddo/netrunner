FROM node:20-bullseye

# Install basic development tools
RUN apt update && apt install -y less man-db sudo

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set `SHELL` so that when we drop into the container via VS Code,
# it opens a bash shell by default
ENV SHELL /bin/bash

# Install global npm packages
RUN npm install -g npm@latest

WORKDIR /workspace 