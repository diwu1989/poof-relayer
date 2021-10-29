FROM node:12
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn && yarn cache clean --force && rm -rf /usr/local/share/.cache/yarn
COPY . .

EXPOSE 8000
