const mcpeping = require('mcpe-ping');

module.exports = {
    name: "mcsrvbedrock",
    fullnm: "MC Bedrock Checker",
    permission: "public",
    description: "MC Bedrock Checker",
    tag: "Tools",
    run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        let args = isipesan.split(" ");
        let server = args[1];
        if (!server) {
            return reply("Penggunaan: mcsrvbedrock IP:PORT\nContoh: mcsrvbedrock play.example.net:19132");
        }

        let [host, port] = server.split(":");
        if (!port) port = 19132;

        mcpeping(host, parseInt(port), (err, res) => {
            if (err || !res || !res.connected) {
                return reply(`❌ Gagal menghubungi server ${host}:${port}\nAlasan: ${err?.message || 'Tidak ada respon'}`);
            }

            // Ambil info dari hasil real
            const motd = res.cleanName || "Tidak tersedia";
            const version = res.version || "Tidak diketahui";
            const playersOnline = res.currentPlayers || "Tidak diketahui";
            const playersMax = res.maxPlayers || "Tidak diketahui";

            reply(`🔧 Server Info:
- Host: ${host}
- Port: ${port}
- MOTD: ${motd}
- Version: ${version}
- Players: ${playersOnline}/${playersMax}
- Online?: Yes`);
        });
    }
};

