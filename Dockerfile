# Dockerfile.rails
FROM ruby:3.0.2 AS rails-toolbox
MAINTAINER Marco Spasiano <marco.spasiano@cnr.it>

ARG USER_ID
ARG GROUP_ID

RUN addgroup --gid $GROUP_ID user
RUN adduser --disabled-password --gecos '' --uid $USER_ID --gid $GROUP_ID user

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg -o /root/yarn-pubkey.gpg && apt-key add /root/yarn-pubkey.gpg
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y --no-install-recommends nodejs yarn

# Update the Packages
RUN apt-get update
# Install container dependencies
RUN apt-get install -y vim libc-ares2 postgresql-client nodejs --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV INSTALL_PATH /opt/app
RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH
COPY . .
RUN rm -rf node_modules vendor
# RUN gem install bundler
RUN bundle install
RUN yarn install
RUN chown -R user:user /opt/app

USER $USER_ID
