# 🧠 WhatsApp Bot — Modular & Dynamic Case System

A simple yet powerful WhatsApp bot using `@whiskeysockets/baileys`, built for developers who want to **add, delete, or manage features directly from WhatsApp**.

No need to restart — new cases can be created or removed via chat itself. Perfect for learning, prototyping, or personal tools.

---

## 🚀 Features
- 🔁 Dynamic case injection (no restarts)
- 💻 Bash & JavaScript eval support for owners
- 📦 Git auto-clone and zip
- 🔒 Session management
- 🔔 Group tools (spamtag, hidetag, anti-status-tag)
- 🧩 Easy-to-expand switch-case structure

---

## 📦 Available Commands (15 Total)
| Case Name        | Aliases    | Description                        |
|------------------|------------|------------------------------------|
| `info`           | –          | Show bot info                      |
| `fcase`          | –          | Show full code of a case           |
| `addcase`        | –          | Add new case from quoted message   |
| `delcase`        | –          | Delete a case by name              |
| `getcase`        | –          | Fetch code of a specific case      |
| `bash`           | `$`        | Run terminal command               |
| `listcase`       | –          | List all available cases           |
| `csesi`          | –          | Clean session except `creds.json`  |
| `eval`           | `>`        | Evaluate JavaScript                |
| `spamtag`        | –          | Spam group with tagged messages    |
| `get`            | –          | Download content from URL          |
| `hidetag`        | `ht`       | Send group message with mentions   |
| `git`            | –          | Clone a Git repo and send ZIP      |
| `reactch`        | `rch`      | React to WA Channel message        |
| `antitagsw`      | `atsw`     | Anti tag-status toggle per group   |

---

## ✨ Example Usage

**➕ Add a new case:**
Reply to a message containing:
```js
case "hello":
  m.reply("Hi there!");
break;
```
Then type `.addcase`

**🗑 Delete a case:**
```
.delcase hello
```

**💻 Bash Command:**
```
$ uptime
```

**📥 Git Clone & Zip:**
```
.git https://github.com/user/repo
```

**📢 Spam Tags:**
```
.spamtag Hello @628xxx|5
```

**😎 Hidetag Group Message:**
```
.ht Stealth message to everyone!
```

**📦 List All Cases:**
```
.listcase
```

**🔒 Clean Session:**
```
.csesi
```

**📡 Get URL content:**
```
.get https://example.com/file.txt
```

**🔥 React to WA Channel Post:**
```
.reactch https://whatsapp.com/channel/xxx hello world
```

**🛡 Enable Anti-Status Tag in Group:**
```
.antitagsw true
```

---

## 🧠 For Developers

To inspect message data:
```
> m
```

Example response:
```js
{
  chat: '120xxxxxxx@g.us',
  sender: '628xxx@s.whatsapp.net',
  text: '> m',
  isOwner: true,
  isGroup: true,
  quoted: undefined,
  ...
}
```

---

## 📁 Project Structure
```
📂 /session
  └── creds.json
📄 case.js
📄 handler.js
📄 package.json
```

---

## 🛠 Built With
- [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys)
- `archiver`, `axios`, `prettier`, `chokidar`, `moment-timezone`, `jimp`, etc.

---

## 👑 Credits
Developed by **fg-project.xyz**, focused on developer-first tools with full runtime flexibility.

---
