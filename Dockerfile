FROM node:12
WORKDIR /app

COPY package.json yarn.lock downloadKeys.sh ./
RUN yarn && yarn cache clean --force
COPY . .

EXPOSE 8000
ENTRYPOINT ["yarn"]
