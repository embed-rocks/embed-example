# Embed.rocks integration example (plain JavaScript)

An example Node.js app for [Embed.rocks](https://embed.rocks/). Use this for starting your own implementation.

Install by: 
  - cloning this repository. 
  - `npm install`
  - `npm start`
  - Then point your browser to http://127.0.0.1:3000

## What this contains

This is a plain JavaScript version of our integration example. The other version, which contains Mustache-like template code for cards can be found [here](https://github.com/embed-rocks/embed-example-2). You can use whichever suits you better.

In `public/js/Card.js` file you will find the template that renders card data into html. You can use that as a basis for your own implementation.

In `public/style/card.style` you will find the Stylus stylesheet code for cards. There is also a compiled CSS file.

This is mostly plain JavaScript, but Browserify is used to bundle JS code. 

## Configuring

Set your API key in `app.js`.

Note that in this example app fetches the embed data on the server site, never exposing the api key to the public. This is how it should be done - securely on the server side, not directly on the client side.

## Safe images

If you want to use a "safe domain" (for safe images), set it in `public/js/Card.js`. Remember to add a trailing slash into it. For example `//safe.mydomain.com/` (for both http and https). You need to have an NGINX setup for this. See the example [nginx.conf](https://gist.github.com/ile/ef57487dc556ef43d694863224a2f02f).
