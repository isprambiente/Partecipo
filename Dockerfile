# Dockerfile.rails
FROM ruby:3.0.3-slim AS rails-toolbox
MAINTAINER Marco Spasiano <marco.spasiano@cnr.it>

ARG USER_ID
ARG GROUP_ID
ENV INSTALL_PATH /opt/app

RUN addgroup --gid $GROUP_ID user
RUN adduser --disabled-password --gecos '' --uid $USER_ID --gid $GROUP_ID user


# add repositories and install dependencies
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends wget gnupg ;\
    wget --quiet -O - https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - ;\
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list ;\
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - ;\
    echo "deb http://apt.postgresql.org/pub/repos/apt bullseye-pgdg main" > /etc/apt/sources.list.d/pgdg.list ;\
    apt-get update ;\
    apt-get install -y --no-install-recommends \
      build-essential \
      imagemagick \
      postgresql-client \
      libpq-dev \
      nodejs \
      yarn \
      libvips-dev ;\
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH
COPY . .

# Install app
RUN rm -rf node_modules vendor ;\
    gem install bundler ;\
    bundle install ;\
    yarn install ;\
    chown -R user:user /opt/app

USER $USER_ID
