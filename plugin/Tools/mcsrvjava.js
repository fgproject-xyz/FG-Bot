const { exec } = require('child_process');

module.exports = {
    name: "mcsrvjava",
    fullnm: "MC Java Checker",
    permission: "public",
    description: "MC Java Checker",
    tag: "Tools",
    run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        let args = isipesan.split(" ")
        let server = args[1]
        if (!server) {return reply("Penggunaan: mcsrvjava IP/Host")}
        async function mcsrvjava(){
            let a = await fetch(`https://api.mcsrvstat.us/3/${server}`)
            let data = await a.json()
            const ip = data.ip;
            const port = data.port;
            const online = data.online;
            const hostname = data.hostname;
            const version = data.version;
            const protocol = data.protocol?.name;
            const motd = data.motd?.clean?.[0];
            const playersOnline = data.players?.online;
            const playersMax = data.players?.max;
            const software = data.software;
            const eulaBlocked = data.eula_blocked;
            const pingSuccess = data.debug?.ping;
            const address = data.debug?.dns?.a?.[0]?.address;
            reply(`🔧 Server Info:
- Hostname: ${hostname}
- IP: ${ip}:${port}
- Version: ${version} (${protocol})
- MOTD: ${motd}
- Players: ${playersOnline}/${playersMax}
- Software: ${software}
- Online?: ${online ? 'Yes' : 'No'}
- Ping OK?: ${pingSuccess ? 'Yes' : 'No'}
- DNS Address: ${address}
- EULA Blocked?: ${eulaBlocked ? 'Yes' : 'No'}`)
        }
        mcsrvjava();
    }
};

