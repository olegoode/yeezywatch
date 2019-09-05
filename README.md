# yeezywatch

This application watches https://yeezysupply.com for layout changes and triggers a predefined IFTTT route along with the provided API key.

Install dependencies: `yarn` or `npm install`.
Add your IFTTT API key to a file named .iftttkey in this directory.
Start the script: `node index.js`

I can recommend using [forever](https://www.npmjs.com/package/forever) to manage this as a service.