const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const owner = config.owner;
const moment = require('moment-timezone');
const now = moment().tz('Asia/Jakarta');
const os = require("os");
const { getUserInfo } = require('./lib/configHelper');
const pluginFolder = path.join(__dirname, 'plugin');

const formatUptime = (s) => {
    if (s >= 86400) return `${(s / 86400).toFixed(1)} Days`;
    if (s >= 3600) return `${(s / 3600).toFixed(1)} Hours`;
    if (s >= 60) return `${(s / 60).toFixed(1)} Minutes`;
    return `${s} Seconds`;
};

async function loadPlugins(tagpl) {
    const dir = path.join(pluginFolder, tagpl.charAt(0).toUpperCase() + tagpl.slice(1));
    let plugins = [];
    fs.readdirSync(dir).forEach(file => {
        const pluginPath = path.join(dir, file);
        delete require.cache[require.resolve(pluginPath)];
        const plugin = require(pluginPath);
        if (plugin && plugin.name && plugin.run) plugins.push(plugin);
    });
    return plugins;
}

function buildQuoted() {
    return {
        key: {
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "kapalkaram",
            participant: "13135550002@s.whatsapp.net"
        },
        messageTimestamp: 1747635005,
        pushName: "mending madang",
        broadcast: false,
        status: 2,
        message: {
            conversation: config.botname,
            messageContextInfo: { messageSecret: "a" }
        }
    };
}

function buildFlowMessage(pelaku, messages, sections, title) {
    const info = getUserInfo(pelaku);
    return {
        image: { url: config.gambar },
        mimetype: "image/png",
        fileLength: 9999999999999,
        caption: `╭─❒ *📆 SERVER TIME*\n│ • Date: ${now.format('DD/MM/YYYY')}\n│ • Time: ${now.format('HH:mm:ss')}\n│ • Day: ${now.format('dddd')}\n╰❒\n\n╭─❒ *🤖 BOT INFO*\n│ • Bot Name: ${config.botname}\n│ • Server Runtime: ${formatUptime(os.uptime())}\n│ • Owner: @${config.owner}\n╰❒\n\n╭─❒ *👤 USER INFO*\n│ • Tag: @${pelaku}\n│ • Name: ${messages[0].pushName}\n│ • Premium: ${info.isPremium ? "✅" : "❌"}\n│ • Owner: ${info.isOwner ? "✅" : "❌"}\n╰❒`,
        footer: "> By fg-project xyz",
        mentions: [config.owner + "@s.whatsapp.net", pelaku + "@s.whatsapp.net"],
        contextInfo: { forwardingScore: 2307, isForwarded: true },
        buttons: [
            {
                buttonId: 'plugin_flow',
                buttonText: { displayText: 'Bawak dehel' },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({ title, sections })
                },
                viewOnce: true
            },
            {
                buttonId: "owner",
                buttonText: { displayText: "Owner" },
                type: 1
            }
        ],
        viewOnce: true,
        headerType: 6
    };
}

function recursiveLoadPlugins(dir, plugins = []) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            recursiveLoadPlugins(fullPath, plugins);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const plugin = require(fullPath);
                if (plugin && plugin.name && plugin.run) {
                    plugins.push(plugin);
                }
            } catch (err) {
                console.error(`[PLUGIN] Error loading ${fullPath}:`, err.message);
            }
        }
    });
    return plugins;
}

module.exports = async function (pelaku, isipesan, typepesan, messages, trueDragon, reply, SikmaPirtex) {
    let lower = isipesan.toLowerCase();
    if (lower.startsWith(".")) {
        let akh = lower.slice(1)
        lower = akh
    }
    if (lower === "menu") {
        const folders = fs.readdirSync(pluginFolder).filter(f => fs.statSync(path.join(pluginFolder, f)).isDirectory());
        const sections = [
            {
                title: "Main Menu",
                rows: folders.map(f => ({
                    header: "",
                    title: `${f} Menu`,
                    description: "",
                    id: `menu_${f.toLowerCase()}`
                }))
            }
        ];
        await trueDragon.sendMessage(messages[0].key.remoteJid, buildFlowMessage(pelaku, messages, sections, 'Main Menu'), { quoted: buildQuoted() });
        return;
    }

    if (lower.startsWith("menu_")) {
        try {
            const folder = lower.split("_")[1];
            const plugins = await loadPlugins(folder);
            const sections = [
                {
                    title: `${folder.charAt(0).toUpperCase() + folder.slice(1)} Menu`,
                    rows: plugins.map(p => ({
                        header: "",
                        title: p.fullnm,
                        description: p.description || "",
                        id: p.name
                    }))
                }
            ];
            await trueDragon.sendMessage(messages[0].key.remoteJid, buildFlowMessage(pelaku, messages, sections, sections[0].title), { quoted: buildQuoted() });
        } catch (err) {
            reply(`${err}`);
        }
        return;
    }

    const plugins = recursiveLoadPlugins(pluginFolder);

    if (typepesan === "buttonsResponseMessage" && lower.startsWith("plugin_exec_")) {
        const pluginName = lower.replace("plugin_exec_", "");
        const plugin = plugins.find(p => p.name === pluginName);
        if (!plugin) return reply("❌ Plugin tidak ditemukan.");
        if (plugin.permission === 'owner' && pelaku !== owner) return reply("❌ Kamu tidak punya izin.");
        return plugin.run(pelaku, plugin.name, typepesan, messages, trueDragon, reply, owner);
    }

    for (const plugin of plugins) {
        if (lower.startsWith(plugin.name)) {
            if (plugin.permission === 'owner' && pelaku !== owner) return reply("❌ Kamu tidak punya izin.");
            return plugin.run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner);
        }
    }
};
