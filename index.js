const puppeteer = require('puppeteer'),
  got = require('got'),
  looksSame = require('looks-same'),
  fs = require('fs'),
  domain = 'https://yeezysupply.com',
  tenMinutes = 1000 * 60 * 10,
  apiKey = fs.readFileSync('./iftttkey', 'utf8');

let prevShotIndex = 0,
  nextShotIndex = 0;

fs.existsSync('./images') || fs.mkdirSync('./images');

function log(message) {
  let timestamp = new Date();
  console.log(timestamp.toLocaleString(), message)
}

async function capture(url, path) {
  let thisShotIndex = nextShotIndex;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
  });
  await page.goto(url);
  await page.screenshot({ path });
  log(`Screenshot ${thisShotIndex} captured.`);
  nextShotIndex > 19 ? nextShotIndex = 0 : nextShotIndex++;
  return browser.close().then(() => thisShotIndex);
}

async function yeezyWatch() {
  capture(domain, `images/screenshot${nextShotIndex}.png`)
    .then(thisShotIndex => {
      const prevShot = `images/screenshot${prevShotIndex}.png`,
        recentShot = `images/screenshot${thisShotIndex}.png`;

      prevShotIndex = thisShotIndex;

      looksSame(prevShot, recentShot, (err, { equal } = {}) => {
        log(`Comparing ${prevShot} with ${recentShot}`);
        if (err) {
          log(`Error comparing screenshots: ${err.message}`);
          return;
        }
        if (!equal) {
          log('Mismatch found! Triggering IFTTT');
          got.post(`https://maker.ifttt.com/trigger/yeezy_sply_updated/with/key/${apiKey}`);
        }
      });
    });
}

capture(domain, `images/screenshot${nextShotIndex}.png`).then(() => {
  log('Starting watch...');
  got.post(`https://maker.ifttt.com/trigger/yeezywatch_init/with/key/${apiKey}`);
  setInterval(yeezyWatch, tenMinutes);
});