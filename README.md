[![buddy pipeline](https://app.buddy.works/radekadamczewski/rabudget-client-vue/pipelines/pipeline/207319/badge.svg?token=e526fabfec06767eae9d1e35382fa7f4a8db20b4cb73226ce7a174a6b0823957 "buddy pipeline")](https://app.buddy.works/radekadamczewski/rabudget-client-vue/pipelines/pipeline/207319)

# raBudget - Vue.js client

SPA Client application for budgeting app. Live version available at [https://budget.rabt.pl](https://budget.rabt.pl). Api for appliaction is available in repository https://github.com/radcki/raBudget-api.

App is using [Vue.js](https://vuetifyjs.com) alongside with UI components framework [Vuetify](http://vuetifyjs.com/).

## Build instructions - docker
Run latest version from registry:
``` console
$ docker pull radekadamczewski/rabudget-client-vue:latest
$ docker run -d -p 4001:80 --network bridge --name rabudget-client-vue radekadamczewski/rabudget-client-vue
```

To build and Docker image from source:

``` console
$ docker build -t rabudget-client-vue .
$ docker run -d -p 4001:80 --network bridge --name rabudget-client-vue rabudget-client-vue
```

## Build instructions - without docker

``` console
$ npm install
$ npm run build

DONE  Build complete. The dist directory is ready to be deployed.
INFO  Check out deployment instructions at https://cli.vuejs.org/guide/deployment.html
```

## Developmnent build with hot-reloading

Application is using vue-cli.  To serve local developement build:

``` console
$ npm install
$ npm serve
DONE  Compiled successfully in 21359ms                                                                                                                                                                               20:28:41

App running at:
- Local:   http://localhost:8080/
- Network: http://192.168.1.100:8080/

Note that the development build is not optimized.
To create a production build, run npm run build.
```

## Hosting - nginx configuration

Container is using nginx image to host files usng nginx.conf file included in repository. When configuring host reverse proxy, only simply proxy_pass should be set up - `"try_files"` is handled inside container. Example configuration:
```nginx
server {
    server_name <your_domain>;
    index index.html;
    location / {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

To host files built without docker, [nginx.conf](nginx.conf) file can be used as configuration reference.