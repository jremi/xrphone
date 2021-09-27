## XRPhone
![main](https://github.com/jremi/xrphone/workflows/Deployment/badge.svg?branch=main)

## Development

To get started:

```shell
$ cd server
```

The npm script `dev:ngrok` updates the Twilio twiml voice url and Autopilot tasks action urls to temporary ngrok development url tunnel. It will also update the associated .env files for both the client and server folders to utilize the ngrok url.

```shell
$ npm run dev:ngrok
```

The npm script `serve` will spawn the Express server with nodemon (file watch mode). It will set the `process.env.NODE_ENV` to `development`.

```shell
$ npm run serve
```

Note, when your ngrok tunnels expire you will want to re-run the `npm run dev:ngrok` and then manually kill and restart `serve`. This will force the server to reload the updated `.env` file containing the updated ngrok urls that get manually injected when you run the `dev:ngrok` script.

## Production

Inside `/client` run `npm run build`. This will build the XRPhone client Vue web app and copy the dist build to the `/server/public` folder.

When running npm script `start` the Express server starts with `process.env.NODE_ENV` set as `production`. You can start the server in production mode by running:

```shell
$ cd server
```

```shell
$ npm run start
```

## Notes

Make sure to set for the client `.env.production` and for server `.env`. The `.env.example` in both the `/server` and the `/client` folders contain all of the necessary environment variables required to make the server / client run.
