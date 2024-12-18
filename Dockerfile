FROM node:23-alpine AS build

WORKDIR /app

# Set environment variables for non-interactive npm installs
ENV YARN_CACHE_FOLDER=/root/.yarn/cache
RUN mkdir -p $YARN_CACHE_FOLDER

RUN corepack enable
RUN yarn set version stable

COPY --chown=node . /app

RUN --mount=type=cache,mode=0777,target=/root/.yarn yarn install --cache-folder ${YARN_CACHE_FOLDER} --frozen-lockfile
RUN --mount=type=cache,mode=0777,target=/root/.yarn yarn build

## Final image
FROM node:23-alpine

RUN yarn global add serve

COPY --from=build /app/dist /root/dist

EXPOSE 3000

ENTRYPOINT [ "serve", "-s", "/root/dist", "-l", "tcp://0.0.0.0:3000" ]
