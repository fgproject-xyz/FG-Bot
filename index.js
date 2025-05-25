// ===== Import Module ===== //
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    jidDecode,
    proto,
    getAggregateVotesInPollMessage,
    PHONENUMBER_MCC
} = require("baileys");
let SikmaPirtex = `⛧࿇࿇࿇𓂀𖣔𒆜𒈙𐍉𐌼𓆩𒁏𖤐𓅓࿇࿇࿇⛧`.repeat(999)
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const FileType = require('file-type');
const readline = require("readline");
const PhoneNumber = require('awesome-phonenumber');
const path = require('path');
const NodeCache = require("node-cache");
const axios = require("axios");
const chalk = require('chalk'); // untuk log berwarna
let config = require("./config.json")
// readline question
const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, (ans) => {
            rl.close();
            resolve(ans);
        });
    });
};


//===== Connect to WhatsApp =====//
async function milim () {
    console.log(chalk.blueBright(`[DEBUG] Starting bot initialization...`));

    // Step 1: Init auth state
    let state, saveCreds;
    try {
        console.log(chalk.yellow(`[DEBUG] Loading authentication state...`));
        const authState = await useMultiFileAuthState("./session");
        state = authState.state;
        saveCreds = authState.saveCreds;

        if (!state) {
            console.error(chalk.red(`[ERROR] State is undefined!`));
            process.exit(1);
        }
        if (!state.creds) {
            console.error(chalk.red(`[ERROR] State.creds is undefined!`));
            console.log('State debug:', state);
            process.exit(1);
        }

        console.log(chalk.green(`[OK] Auth state loaded.`));
    } catch (err) {
        console.error(chalk.red(`[FATAL ERROR] Failed to load auth state:`), err);
        process.exit(1);
    }

    // Step 2: Fetch version
    let version;
    try {
        console.log(chalk.yellow(`[DEBUG] Fetching latest Baileys version...`));
        const res = await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json');
        const json = await res.json();
        version = json.version;
        console.log(chalk.green(`[OK] Using Baileys version: ${version}`));
    } catch (err) {
        console.error(chalk.red(`[ERROR] Failed to fetch version:`), err);
        version = [2, 2312, 11]; // fallback default
    }

    // Step 3: Create WA Socket
    console.log(chalk.yellow(`[DEBUG] Creating WhatsApp socket...`));
    const trueDragon = makeWASocket({
        printQRInTerminal: !config.pairing.usePairingCode,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        generateHighQualityLinkPreview: true,
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        },
        version,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        logger: pino({ level: 'silent' }), 
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        }
    });

    console.log(chalk.green(`[OK] WhatsApp socket created.`));

    // Step 4: Check if not registered
    if (config.pairing.usePairingCode) {
        console.log(chalk.blue(`[Client] Starting Bot Using Pairing Code`));
    if (!trueDragon.authState.creds.registered) {
        console.log(chalk.cyan("Masukkan Nomormu Ex. 628xxxx:"));
        const phoneNumber = await question(chalk.cyan(""));
        const code = await trueDragon.requestPairingCode(phoneNumber, config.pairing.CostumPairingCode);
        console.log(chalk.magenta(`This is your pairing code: ${code}`));
    }
    } else {
        console.log(chalk.blue(`[Client] Starting Bot Using QR Code`));
    }

    // Step 5: Setup Store
    const store = makeInMemoryStore({
        logger: pino({ level: 'silent' })
    });

    // Step 6: Event handlers
    trueDragon.ev.on('messages.upsert', ({ messages }) => {
        let pelaku = ""
        let isipesan = ""
        let typepesan = ""
        try {
        if (messages[0].message.conversation) {
            isipesan = messages[0].message.conversation || ""
            typepesan = "Conversation"
        } else if (messages[0].message.imageMessage) {
            isipesan = messages[0].message.imageMessage.caption || ""
            typepesan = "ImageMessage [ " + messages[0].message.imageMessage.mimetype + " ]"
        } else if (messages[0].message.stickerMessage) {
            typepesan = "StickerMessage [ " + messages[0].message.stickerMessage.mimetype + " ]" 
        } else if (messages[0].message.videoMessage) {
            typepesan = "VideoMessage [ " + messages[0].message.videoMessage.mimetype + " ]"
            isipesan = messages[0].message.videoMessage.caption || ""
        } else if (messages[0].message.audioMessage) {
            typepesan = "AudioMessage [ " + messages[0].message.audioMessage.mimetype + " ]" 
        } else if (messages[0].message.pollCreationMessage) {
            typepesan = "pollCreationMessage [V1]";
            isipesan = messages[0].message.pollCreationMessageV1.name || ""
        } else if (messages[0].message.pollCreationMessageV2) {
            typepesan = "pollCreationMessage [V2]";
            isipesan = messages[0].message.pollCreationMessageV2.name || ""
        } else if (messages[0].message.pollCreationMessageV3) {
            typepesan = "pollCreationMessage [V3]";
            isipesan = messages[0].message.pollCreationMessageV3.name || ""
        } else if (messages[0].message.locationMessage) {
            typepesan = "LocationMessage [ Latitude: " + messages[0].message.locationMessage.degreesLatitude + ", Longtitude: " + messages[0].message.locationMessage.degreesLongitude + " ]"
        } else if (messages[0].message.extendedTextMessage) {
            typepesan = "ExtendedTextMessage"
            isipesan = messages[0].message.extendedTextMessage.text || ""
        } else if (messages[0].message.interactiveResponseMessage) {
            typepesan = "InteractiveResponseMessage"
            let flowData = JSON.parse(messages[0].message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
            isipesan = flowData.id || ""
        } else { console.log(messages[0]) } 
    } catch (err) {console.log(err)}
        if (messages[0].key.participant) {
            pelaku = messages[0].key.participant.split("@")[0] 
        } else if (messages[0].key.remoteJid) {
            pelaku = messages[0].key.remoteJid.split("@")[0]
        }
        console.log(chalk.cyan.bold('[EVENT]'), chalk.magentaBright('Message Update:'));
        console.log(chalk.green('├──'), chalk.yellow('Name:'), chalk.white(messages[0].pushName));
        console.log(chalk.green('├──'), chalk.yellow('Number:'), chalk.white(pelaku));
        console.log(chalk.green('├──'), chalk.yellow('JID:'), chalk.white(messages[0].key.remoteJid));
        console.log(chalk.green('├──'), chalk.yellow('Type:'), chalk.white(typepesan));
        console.log(chalk.green('└──'), chalk.yellow('Text/Caption:'), chalk.white(isipesan));
        //console.log(JSON.stringify(messages[0], null, 2))
        const qch = {
            key: {
            remoteJid: 'status@broadcast',
            fromMe: false,
            participant: '0@s.whatsapp.net'
            },
            message: {
            newsletterAdminInviteMessage: {
            newsletterJid: `120363416949803852@newsletter`,
            newsletterName: config.botname,
            thumbnail: null,
            caption: `Hi Sir`,
            inviteExpiration: Date.now() + 1814400000
            }
            }}
        async function reply(teks) { 
            trueDragon.sendMessage(messages[0].key.remoteJid, { text: teks, contextInfo: {
            mentionedJid: [pelaku + "@s.whatsapp.com"],
            externalAdReply: {
            showAdAttribution: false,
            renderLargerThumbnail: false,
            title: config.botname,
            body: `Version 1 Beta`,
            previewType: "1",
            thumbnailUrl: "https://static.wikia.nocookie.net/tensei-shitara-slime-datta-ken/images/3/31/LN_05_03.jpg",
            sourceUrl: `https://whatsapp.com/channel/0029Vb5foUKCRs1wZxSkOX46`,
            mediaUrl: `https://whatsapp.com/channel/0029Vb5foUKCRs1wZxSkOX46`
            },
            newsletterAdminInviteMessage: {
            newsletterJid: `120363416949803852@newsletter`,
            newsletterName: `Milim Nava`,
            thumbnail: null,
            caption: `Bot-MD`,
            inviteExpiration: Date.now() + 1814400000
            }
            },
            text: teks
            }, {quoted: qch}) 
            }
        require("./octagram.js") (pelaku, isipesan, typepesan, messages, trueDragon, reply, SikmaPirtex)
    })
    trueDragon.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        console.log(chalk.cyan(`[EVENT] Connection Update:`), update);
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red(`[DISCONNECTED] Reason: ${lastDisconnect?.error?.output?.statusCode}`));
            if (shouldReconnect) {
                console.log(chalk.yellow(`[INFO] Reconnecting...`));
                milim();
            } else {
                console.log(chalk.red(`[LOGGED OUT] No reconnect.`));
            }
        } else if (connection === 'open') {
            console.log(chalk.green(`[CONNECTED] Bot connected to WhatsApp.`));
        }
    });

    trueDragon.ev.on('error', (err) => {
        console.error(chalk.red(`[ERROR] Socket error:`), err);
    });

    trueDragon.ev.on('creds.update', saveCreds);

    console.log(chalk.greenBright(`[READY] Bot is now up and running.`));
}

milim();
