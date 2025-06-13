const { OrderKuota } = require("orderkuota");
const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");

/**
 * Generate QRIS base64 image from credentials and nominal
 * @param {string} username
 * @param {string} password
 * @param {string} userid
 * @param {string} apikey
 * @param {string} pin
 * @param {string} baseQrString
 * @param {number} nominal
 * @returns {Promise<string>} Base64 image string (PNG)
 */
async function GenerateQR(username, password, userid, apikey, pin, baseQrString, nominal) {
  const config = {
    username,
    password,
    userid,
    apikey,
    pin,
    baseQrString
  };

  const client = new OrderKuota(config);

  if (!client.isQrisGenerationAvailable()) {
    throw new Error('Base QR string is not configured properly.');
  }

  try {
    // Step 1: Generate QRIS string
    const qrisString = await client.generateQrisString(nominal);

    // Step 2: Create canvas
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Step 3: Generate QR code to canvas
    await QRCode.toCanvas(canvas, qrisString, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Step 4: Draw overlay text in the middle
    const fontSize = 24;
    ctx.font = `${fontSize}px Sans`;
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FG Project XYZ', size / 2, size / 2);

    // Step 5: Return base64
    return canvas.toBuffer('image/png').toString('base64');

  } catch (err) {
    throw new Error(`QR generation failed: ${err.message}`);
  }
}

module.exports = GenerateQR;
