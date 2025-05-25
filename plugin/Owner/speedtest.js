const { exec } = require('child_process');

module.exports = {
    name: "speedtest",
    fullnm: "Speedtest",
    permission: "owner",
    description: "Uji Kecepatan Jaringan Bot",
    tag: "Owner",
    run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        reply("⏳ Sedang melakukan speedtest, mohon tunggu...");

        exec('speedtest --share --simple', (error, stdout, stderr) => {
            if (error || stderr) {
                reply(`❌ Gagal menjalankan speedtest.\n${stderr || error.message}`);
                return;
            }

            reply(`📡 Hasil Speedtest:\n\n${stdout.trim()}`);
        });
    }
};


