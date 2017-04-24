# Embed.rocks integration example

An example Node.js app for [Embed.rocks](https://embed.rocks/)

Install by: 
  - cloning this repository. 
  - `npm install`
  - `npm start`
  - Then point your browser to http://127.0.0.1:3000

## Configuring

Set your API key in `app.js`.

Note that in this example app fetches the embed data on the server site, never exposing the api key to the public. This is how it should be done - securely on the server side, not directly on the client side.

## Safe images

If you want to use a "safe domain" (for safe images), set it in `public/js/Card.js`. Remember to add a trailing slash into it. For example `//safe.mydomain.com/` (for both http and https). You need to have an NGINX setup for this. See the example [nginx.conf](https://gist.github.com/ile/ef57487dc556ef43d694863224a2f02f).
