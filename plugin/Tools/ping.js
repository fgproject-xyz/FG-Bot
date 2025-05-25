const { exec } = require('child_process');  // Modul untuk menjalankan perintah bash
const os = require('os');  // Modul untuk mendapatkan informasi platform

module.exports = {
    name: "ping",
    fullnm: "Check Info Bot",
    permission: "public",
    description: "Informasi Bot",
    tag: "Tools",
    run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        // Jalankan perintah uptime bash untuk mendapatkan uptime server
        exec('uptime -p', (error, stdout, stderr) => {
            if (error) {
                reply(`❌ Gagal mendapatkan uptime server: ${stderr}`);
                return;
            }

            // Dapatkan informasi RAM, CPU, dan platform server
            const memory = os.totalmem();
            const freeMemory = os.freemem();
            const cpuModel = os.cpus()[0].model;
            const cpuCores = os.cpus().length;
            const platform = os.platform();
            const release = os.release();

            const serverSpecs = `
[ Server Specification ]
- Total RAM: ${(memory / 1024 / 1024 / 1024).toFixed(2)} GB
- Used RAM: ${((memory - freeMemory) / 1024 / 1024 / 1024).toFixed(2)} GB
- Free RAM: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB
- Platform: ${platform} (${release})
- Arch: ${os.arch()}
- CPU Model: ${cpuModel}
- CPU Cores: ${cpuCores}
- Server Uptime: ${stdout.trim()}

[ Info Bot ]
- Version: 1.0.0
- Owner: ${owner}
            `;

            reply(serverSpecs);
        });
    }
};

