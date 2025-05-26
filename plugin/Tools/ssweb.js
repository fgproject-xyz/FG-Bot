const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "ssweb",
    fullnm: "Website Screenshot",
    description: "Take a screenshot of a website",
    permission: "public", // bisa diakses semua

    run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        let args = isipesan.split(" ");
        let url = args[1];
        if (!url) return reply("Usage: .ssweb <URL>");

        const filename = `ss_${Date.now()}.png`;
        const filepath = path.join(__dirname, filename);
        const command = `node -e "const puppeteer = require('puppeteer'); (async () => {
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            await page.goto('${url}', {waitUntil: 'networkidle2', timeout: 60000});
            await page.screenshot({ path: '${filepath}' });
            await browser.close();
        })();"`;

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return reply("Failed to take screenshot.");
            }
            if (stderr) console.error(`stderr: ${stderr}`);

            await trueDragon.sendMessage(messages[0].key.remoteJid, {
                image: { url: filepath },
                caption: `Screenshot of: ${url}`
            });

            fs.unlinkSync(filepath); // hapus file setelah kirim
        });
    }
};
