const { exec } = require('child_process');
const axios = require('axios');
module.exports = {
    name: "tt",
    fullnm: "Tiktok Downloader",
    description: "Tiktok Downloader",
    permission: "public",
    tag: "Download",
    run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        let args = isipesan.split(" ")
        let server = args[1]
        if (!server) {return reply("Penggunaan: tt (url)")}
        async function ttdl(){
            const apiUrl = `https://tikwm.com/api/`;
            const response = await axios.get(apiUrl, {
                params: {
                  url: server
                }
              });
            const data = response.data;
            if (data && data.data && data.data.play) {
                    console.log('Download URL tanpa watermark:', data.data.play);
                    trueDragon.sendMessage(messages[0].key.remoteJid, {video: {
                        url: data.data.play
                    }, caption: data.data.title})
                } else {
                    reply('Gagal mendapatkan data');
                }
        }
        ttdl();
    }
};

