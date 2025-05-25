
# 🌟 FG Bot - Simple WhatsApp Bot 🤖

![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-green?style=for-the-badge&logo=node.js)
![Platform](https://img.shields.io/badge/Platform-WhatsApp-blue?style=for-the-badge&logo=whatsapp)
![License](https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge)

---

## 📌 Description

**FG Bot** is a lightweight, modular WhatsApp bot built using [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys). It offers powerful automation features, support for interactive buttons, and an easy-to-extend plugin system, making it perfect for both beginners and advanced developers.

---

## 🚀 Features

- ✅ Clean and maintainable codebase
- 💬 Auto-reply support
- 🔘 Button interactions
- 🧩 Modular plugin architecture
- ☁️ Ready to deploy on VPS or local
- 🛡️ Lightweight and user-friendly

---

## 🧩 Tech Stack

- **Runtime:** Node.js
- **WhatsApp API:** [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys)
- **Architecture:** Plugin-based command system

---

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/fgproject-xyz/FG-Bot

# Navigate to the project directory
cd FG-Bot

# Install dependencies
npm install

# Start the bot
npm start
```

---

## ⚙️ Configuration

The `config.json` file contains basic bot settings:

```json
{
  "owner": ["6281234567890"],
  "premium": ["6289876543210"],
  "sessionName": "fgbot",
  "prefix": ".",
  "autoread": true,
  "public": true
}
```

### Configuration Keys:
- `owner`: Array of WhatsApp numbers with full access (in international format).
- `premium`: Array of premium user numbers.
- `sessionName`: Session folder name for Baileys authentication.
- `prefix`: Command prefix (e.g., `.`, `!`, etc.).
- `autoread`: Automatically marks messages as read.
- `public`: Set `true` for public access or `false` for private.

---

## 🧩 Creating Plugins

Adding a plugin is simple and modular. Each plugin is a separate `.js` file stored inside a subfolder in the `plugin/` directory. Each subfolder acts as a **menu category**.

### Steps to Add a Plugin:

1. Go to the `plugin/` directory.
2. Create a new folder (e.g., `Downloader`) or use an existing one.
3. Add a new `.js` file inside it with the following structure:

```js
const { exec } = require('child_process');
const axios = require('axios');

module.exports = {
    name: "tt", // Trigger command (e.g., .tt)
    fullnm: "Tiktok Downloader", // Full feature name
    description: "Download videos from TikTok", // Description
    permission: "public", // Options: public, premium, owner

    run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        let args = isipesan.split(" ");
        let url = args[1];
        if (!url) return reply("Usage: .tt <TikTok URL>");

        async function ttdl() {
            try {
                const apiUrl = `https://tikwm.com/api/`;
                const response = await axios.get(apiUrl, {
                    params: { url }
                });
                const data = response.data;
                if (data && data.data && data.data.play) {
                    trueDragon.sendMessage(messages[0].key.remoteJid, {
                        video: { url: data.data.play },
                        caption: data.data.title
                    });
                } else {
                    reply("Failed to fetch TikTok video.");
                }
            } catch (err) {
                console.error(err);
                reply("An error occurred while processing the request.");
            }
        }

        ttdl();
    }
};
```

> You can duplicate this format to create other features such as YouTube downloader, group tools, games, utilities, and more.

---

## 📬 Contribution

Contributions are welcome! Feel free to fork the repo, create a plugin, and submit a pull request. Make sure your code is clean and well-documented.

---

## 📄 License

This project is licensed under the MIT License.
