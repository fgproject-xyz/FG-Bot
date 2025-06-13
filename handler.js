const fs = require("fs");
const { OrderKuota } = require("orderkuota");
const os = require('os');
const GenerateQR = require('./lib/generateQR');
const {
  config,
  addGroup,
  isGroupExist,
  cekWarnUser,
  addUserToGroup,
  incrementWarn,
  toggleGroupStatus,
  cekToggleGroup
} = require('./lib/configHandler');
const prettier = require('prettier');
module.exports = async function (pelaku, isipesan, typepesan, messages, trueDragon, reply, SikmaPirtex, replya) {
    const m = messages[0];
    const conn = trueDragon;
    m.sender = pelaku + "@s.whatsapp.net";
    m.text = isipesan;
    m.chat = m.key.remoteJid;
    m.reply = reply;
    m.replym = replya;
    m.id = m.key.id
    m.isBaileys = m.id ? (m.id.startsWith('3EB0') || m.id.startsWith('B1E') || m.id.startsWith('BAE') || m.id.startsWith('3F8') || m.id.startsWith('FELZ') || m.id.startsWith('7FD2') || m.id.startsWith('KyuuRzy') || m.id.startsWith('MikirBot') || m.id.startsWith('Laurine')) : false
    m.quoted = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage
    m.isGroup = false
    
    if (m.chat.includes("@g.us")) {
        addGroup(m.chat)
        m.isGroup = true
        addUserToGroup(m.chat, m.sender)
        if (isGroupExist) {
            if (cekToggleGroup(m.chat, 'antitagsw')) {
                if (m?.message?.groupStatusMentionMessage?.message?.protocolMessage?.type) {
                    await conn.sendMessage(m.chat, { delete: m.key })
                    let ambalabu = await incrementWarn(m.chat, m.sender)
                    if (cekWarnUser(m.chat, m.sender) >= 5) {
                        conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
                        m.reply(`🚫 Pengguna Telah Menerima 5/5 Peringatan Dan Telah Dikeluarkam Dari Group`)
                    } else {
                        m.reply(`⚠️ Peringatan Ke ${ambalabu}/5 Untuk @${m.sender.split("@")[0]}`)
                    }
                }
            }
        }
        }
//console.log("A");

async function cekAdmin(conn, chatId, sender) {
    try {
        const meta = await conn.groupMetadata(chatId);
        if (!meta || !meta.participants) return undefined;
        const admins = meta.participants.filter(p => p.admin).map(p => p.id);
        if (!admins.length) return undefined;
        return admins.includes(sender);
    } catch {
        return undefined;
    }
}

//console.log("B");

if (m.chat.endsWith("@g.us")) {
    m.isAdmin = await cekAdmin(conn, m.chat, m.sender);
} else {
    m.isAdmin = false;
}
m.isOwner = config.owner.includes(m.sender.split("@")[0]);
m.isPremium = config.premium.includes(m.sender.split("@")[0]);
m.mtype = typepesan;
//console.log("C");

const mentionTag = jid => jid?.split("@")[0] + "@s.whatsapp.net";
const tagText = jid => "@" + jid?.split("@")[0];
//console.log("D");

    switch (m?.messageStubType) {
        case 20:
            m.replym(`📢 *Group Notification*\n\n🇺🇸 Group successfully created.\n🇮🇩 Grup berhasil dibuat.`);
            break;

        case 21:
            m.replym(`📢 *Group Notification*\n\n🇺🇸 Group name changed to: "${m?.messageStubParameters?.[0]}"\n🇮🇩 Nama grup diubah menjadi: "${m?.messageStubParameters?.[0]}"`);
            break;

        case 22:
            m.replym(`📢 *Group Notification*\n\n🇺🇸 Group icon was updated.\n🇮🇩 Ikon grup diperbarui.`);
            break;

        case 24:
            m.replym(`📢 *Group Notification*\n\n🇺🇸 Group description updated.\n🇮🇩 Deskripsi grup diperbarui.`);
            break;

        case 25: {
            const info = m?.messageStubParameters?.[0] === "on"
                ? { en: "Only *admins* can edit group info.", id: "Hanya *admin* yang dapat mengedit info grup." }
                : { en: "All *members* can edit group info.", id: "Semua *anggota* dapat mengedit info grup." };
            m.replym(`📢 *Group Notification*\n\n📝 Group Info Permissions Changed\n🇺🇸 ${info.en}\n🇮🇩 ${info.id}`);
            break;
        }

        case 26: {
            const status = m?.messageStubParameters?.[0] === "on"
                ? { en: "Group has been *closed*.\nOnly admins can send messages.", id: "Grup telah *ditutup*.\nHanya admin yang dapat mengirim pesan." }
                : { en: "Group has been *opened*.\nAll members can send messages.", id: "Grup telah *dibuka*.\nSemua anggota dapat mengirim pesan." };
            m.replym(`📢 *Group Notification*\n\n🔧 Group Message Settings Changed\n🇺🇸 ${status.en}\n🇮🇩 ${status.id}`);
            break;
        }

        case 27:
            m.replym(`📢 *Group Notification*\n\n👤 *Added:* ${tagText(m?.messageStubParameters?.[0])}\n➕ Telah ditambahkan ke grup.`, mentionTag(m?.messageStubParameters?.[0]));
            break;

        case 28:
        case 32:
            m.replym(`📢 *Group Notification*\n\n👋 *Left:* ${tagText(m?.messageStubParameters?.[0])}\n🚪 Telah keluar dari grup.`, mentionTag(m?.messageStubParameters?.[0]));
            break;

        case 29:
            m.replym(`📢 *Group Notification*\n\n🛡️ *Promoted:* ${tagText(m?.messageStubParameters?.[0])}\n⬆️ Dipromosikan sebagai admin.`, mentionTag(m?.messageStubParameters?.[0]));
            break;

        case 30:
            m.replym(`📢 *Group Notification*\n\n⚠️ *Demoted:* ${tagText(m?.messageStubParameters?.[0])}\n⬇️ Diturunkan dari admin.`, mentionTag(m?.messageStubParameters?.[0]));
            break;

        case 171: {
            const add = m?.messageStubParameters?.[0] === "admin_add"
                ? { en: "Only *admins* can add new members.", id: "Hanya *admin* yang dapat menambahkan anggota." }
                : { en: "All *members* can add new members.", id: "Semua *anggota* dapat menambahkan anggota." };
            m.replym(`📢 *Group Notification*\n\n🛠️ Group Add Member Settings Changed\n🇺🇸 ${add.en}\n🇮🇩 ${add.id}`);
            break;
        }
    }
    async function autocheck(nominal) {
  const intervalMs = 10000;       // 10 detik
  const totalDurationMs = 300000; // 5 menit
  let found = false;

  return new Promise((resolve) => {
    async function checkAPI() {
      try {
        let klien = new OrderKuota({
    username: config.payment.usernameOrkut,
    password: config.payment.passwordOrkut,
    userid: config.payment.usernameOrkut,
    apikey: config.payment.apiOrkut,
    pin: config.payment.pin,
    baseQRString: config.payment.qrisOrkut
  })
        const history = await klien.fetchQrisHistory();
        if (history.data) {
          for (const transaction of history.data) {
            console.log(`Transaction: ${transaction.id} - ${transaction.amount}`);
            if (transaction.amount === nominal) {
              console.log(`✅ Nominal cocok: ${transaction.amount}`);
              found = true;
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              resolve(true);
              return;
            }
          }
        }
      } catch (error) {
        console.error('❌ Gagal fetch QRIS history:', error.message);
      }
    }

    const intervalId = setInterval(checkAPI, intervalMs);
    const timeoutId = setTimeout(() => {
      if (!found) {
        clearInterval(intervalId);
        resolve(false);
      }
    }, totalDurationMs);

    // Jalankan langsung sekali di awal
    checkAPI();
  });
}
async function processpayment(ambalabu) {
  function random2Digits() {
    let digits = '';
    for (let i = 0; i < 2; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    return digits; // kembalikan string biar gampang gabung
  }

  ambalabu = ambalabu.toString();

  // Buang 2 digit terakhir, ambil bagian depan
  let base = ambalabu.slice(0, -2);

  // Ambil 2 digit random
  let randomPart = random2Digits();

  // Gabungkan
  let ajgStr = base + randomPart;

  // Kalau base kosong (misal ambalabu < 100), pastikan tetap angka valid
  let ajg = parseInt(ajgStr, 10);

  // Lanjut proses pake ajg
  const base64Input = await GenerateQR(
    config.payment.usernameOrkut,
    config.payment.passwordOrkut,
    config.payment.merchantIDOrkut,
    config.payment.apiOrkut,
    config.payment.pin,
    config.payment.qrisOrkut,
    ajg
  );

  const base64Clean = base64Input.includes(',') ? base64Input.split(',')[1] : base64Input;

  await conn.sendMessage(m.chat, {
    image: Buffer.from(base64Clean, 'base64'),
    caption: `⚠️ *Invoice Tersedia – Pembayaran Menunggu*

Tagihan sebesar *Rp ${ajg}* telah dibuat.  
Silakan selesaikan pembayaran dengan scan QR code yang diberikan dalam waktu *5 menit*.

Pembayaran akan otomatis terverifikasi tanpa perlu mengirim bukti.

Setelah konfirmasi, produk akan segera dikirimkan.

Terima kasih atas perhatian Anda.`
  });

  let sacret = await autocheck(ajg);
  return sacret;
}


    const loadCase = () => {
  delete require.cache[require.resolve('./case.js')];
  require('./case.js')(m, conn, fs, os, prettier, toggleGroupStatus, cekToggleGroup, config, processpayment);
};

// Jalankan pertama kali
loadCase();

// Auto reload kalau file case.js berubatoggleGroupStatus, cekToggleGrouph
/*fs.watchFile('./case.js', () => {
  console.log('♻️ case.js updated & reloaded.');
  loadCase();
});*/


    console.log(JSON.stringify(m, null, 2));
};
