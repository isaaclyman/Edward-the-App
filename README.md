# Edward the App

> A better way to outline and write novels, essays, speeches, scripts and more

## Build Setup

``` bash
# install dependencies
npm install

# serve client app with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# build and serve full-stack app at localhost:3000
npm run start
# OR
npm run server

# serve Node server app with auto reload at localhost:3000
npm run server-dev 
```

For local development, you'll need a root-level `.env` file with the following keys:

`DATABASE_URL={connectionString}`: A connection string for a local Postgres database. An empty database with a `public` schema and no tables should be sufficient; the ORM will create the tables and relations automatically.
`DEBUG_DB={true|false}`: When true, all database calls will be logged to the server console.
`INSECURE_COOKIES={true|false}`: When true, the "secure" parameter will not be set for auth cookies. This is required for local development.
`RECAPTCHA_SECRET={secret}`: A valid Google Recaptcha site secret. If you're developing locally on /auth, you'll also need to set `window.recaptchaSiteKey` to a valid site key after page load. By default, this is set in `auth.html`.
`SESSION_COOKIE_SECRET={secret}`: A secret to use for encrypting and decrypting session cookies.

API requests will automatically be proxied from port 8080 to port 3000. For full-stack development, you can run `npm run dev` and `npm run server-dev` side by side.