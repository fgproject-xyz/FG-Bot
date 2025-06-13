module.exports = async function (
  m,
  conn,
  fs,
  os,
  prettier,
  toggleGroupStatus,
  cekToggleGroup,
  config,
  processpayment,
) {
  let sigma = m.text.split(' ')[0] || m.text;
  sigma = sigma.toLowerCase();
  if (sigma.startsWith('.')) {
    sigma = sigma.split('.')[1];
  }
  switch (sigma) {
    case `info`:
      {
        function formatBytes(bytes) {
          const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
          const i = Math.floor(Math.log(bytes) / Math.log(1024));
          return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
        }

        function formatUptime(sec) {
          const m = Math.floor(sec / 60) % 60;
          const h = Math.floor(sec / 3600);
          return `${h}h ${m}m`;
        }

        function serverInfo() {
          const start = performance.now();

          const totalMem = os.totalmem();
          const freeMem = os.freemem();
          const usedMem = totalMem - freeMem;
          const cpus = os.cpus();

          const end = performance.now();
          const responseTime = (end - start).toFixed(2);

          m.reply(`🖥️ *Server Info*
━━━━━━━━━━━━━━━━━━
🌐 *OS:* ${os.type()} (${os.platform()}) ${os.release()}
🕒 *Uptime:* ${formatUptime(os.uptime())}
💾 *RAM:* ${formatBytes(usedMem)} / ${formatBytes(totalMem)}
⚙️ *CPU:* ${cpus[0].model}
🔢 *Cores:* ${cpus.length}
📡 *Response:* ${responseTime} ms
━━━━━━━━━━━━━━━━━━`);
        }

        serverInfo();
      }
      break;
    case 'fcase':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );
        (async () => {
          try {
            const filePath = 'case.js';
            let content = fs.readFileSync(filePath, 'utf-8');

            // Jangan replace newline literal, biarkan asli
            // content = content.replace(/\n/g, '\\n');

            const formatted = await prettier.format(content, {
              semi: true,
              singleQuote: true,
              parser: 'espree', // lebih toleran terhadap JS modern
            });

            fs.writeFileSync(filePath, formatted);

            m.reply('✅ File berhasil direcode dan diformat.');
          } catch (err) {
            m.reply(`❌ Gagal format: ${err.message}`);
          }
        })();
      }
      break;
    case 'addcase':
      if (!m.isOwner)
        return m.reply(
          'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
        );
      {
        (async () => {
          try {
            const filePath = 'case.js';

            // Pastikan ada quoted
            if (!m.quoted || !m.quoted.conversation) {
              return m.reply('❌ Reply ke kode case yang ingin ditambahkan.');
            }

            const newCaseRaw = m.quoted.conversation.trim();

            if (!newCaseRaw.startsWith('case')) {
              return m.reply(
                '❌ Format tidak valid. Harus dimulai dengan `case `',
              );
            }

            // Baca file case.js
            let content = fs.readFileSync(filePath, 'utf-8');

            // Cari posisi break terakhir
            const lastBreakIndex = content.lastIndexOf('break;');

            if (lastBreakIndex === -1) {
              return m.reply('❌ Tidak ditemukan `break;` di file case.js.');
            }

            // Sisipkan setelah break terakhir
            const before = content.slice(0, lastBreakIndex + 6); // +6 biar sampai akhir 'break;'
            const after = content.slice(lastBreakIndex + 6);
            const updatedContent = `${before}\n\n${newCaseRaw}\n${after}`;

            // Format pakai Prettier
            const formatted = await prettier.format(updatedContent, {
              semi: true,
              singleQuote: true,
              parser: 'espree',
            });

            fs.writeFileSync(filePath, formatted);

            m.reply('✅ Case berhasil ditambahkan dan diformat.');
          } catch (err) {
            m.reply(`❌ Gagal menambahkan case: ${err.message}`);
          }
        })();
      }
      break;
    case 'delcase':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );
        (async () => {
          try {
            const filePath = 'case.js';
            const caseName = m.text.split(' ')[1];

            if (!caseName)
              return m.reply(
                '❌ Masukkan nama case yang ingin dihapus.\nContoh: .delcase halo',
              );

            // Baca isi file
            let content = fs.readFileSync(filePath, 'utf-8');

            // Regex untuk cari case lengkap (dari "")
            const regex = new RegExp(
              `case [\`'"]${caseName}[\`'"]:[\\s\\S]*?break;`,
              'g',
            );

            if (!regex.test(content)) {
              return m.reply(
                `❌ Case \`${caseName}\` tidak ditemukan di case.js`,
              );
            }

            // Hapus case tersebut
            const updatedContent = content
              .replace(regex, '')
              .replace(/\n{3,}/g, '\n\n'); // rapikan newline

            // Format ulang
            const formatted = await prettier.format(updatedContent, {
              semi: true,
              singleQuote: true,
              parser: 'espree',
            });

            fs.writeFileSync(filePath, formatted);

            m.reply(`✅ Case \`${caseName}\` berhasil dihapus dan diformat.`);
          } catch (err) {
            m.reply(`❌ Gagal hapus case: ${err.message}`);
          }
        })();
      }
      break;

    case 'getcase':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );
        try {
          const filePath = 'case.js';
          const caseName = m.text.split(' ')[1];

          if (!caseName)
            return m.reply('❌ Masukkan nama case.\nContoh: .getcase halo');

          const content = fs.readFileSync(filePath, 'utf-8');

          const regex = new RegExp(
            `case [\`'"]${caseName}[\`'"]:[\\s\\S]*?break;`,
            'g',
          );

          const match = content.match(regex);

          if (!match) {
            return m.reply(`❌ Case \`${caseName}\` tidak ditemukan.`);
          }

          // Kirim isi case (maks 4096 karakter agar aman di WA)
          const result = match[0].trim();
          if (result.length > 4000) {
            return m.reply('⚠️ Case terlalu panjang untuk dikirim.');
          }

          m.reply('📦 *Isi Case:*\n\n' + '```js\n' + result + '\n```');
        } catch (err) {
          m.reply(`❌ Gagal ambil case: ${err.message}`);
        }
      }
      break;

    case 'listcase':
      {
        const filePath = './case.js';
        if (!fs.existsSync(filePath))
          return m.reply('❌ File case.js tidak ditemukan.');

        try {
          const content = fs.readFileSync(filePath, 'utf-8');

          // Split berdasarkan baris, cari blok case sampai
          const lines = content.split('\n');
          const list = [];
          let temp = [];

          for (let line of lines) {
            line = line.trim();

            // Deteksi baris case
            const caseMatch = line.match(/^case\s+['"`](.+?)['"`]\s*:/);
            if (caseMatch) {
              temp.push(caseMatch[1]);
            }

            // Deteksi akhir blok
            if (/^break;?$/.test(line) && temp.length) {
              list.push(temp.join(' / '));
              temp = [];
            }
          }

          if (!list.length) return m.reply('📭 Tidak ada case ditemukan.');

          const result = list.map((x, i) => `🔹 ${i + 1}. ${x}`).join('\n');

          m.reply(
            `📦 *Daftar Case (${list.length})*\n━━━━━━━━━━━━━━━━━━\n${result}`,
          );
        } catch (err) {
          m.reply(`❌ Gagal membaca file case.js:\n${err.message}`);
        }
      }
      break;

    case 'csesi':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );
        const sessionPath = './session';

        try {
          if (!fs.existsSync(sessionPath))
            return m.reply('❌ Folder ./session tidak ditemukan.');

          const files = fs.readdirSync(sessionPath);
          let deleted = 0;

          for (const file of files) {
            if (file !== 'creds.json') {
              const fullPath = `${sessionPath}/${file}`;
              if (fs.lstatSync(fullPath).isFile()) {
                fs.unlinkSync(fullPath);
                deleted++;
              }
            }
          }

          m.reply(
            `✅ Berhasil menghapus ${deleted} file sampah di folder ./session (kecuali creds.json)`,
          );
        } catch (err) {
          m.reply(`❌ Gagal menghapus file: ${err.message}`);
        }
      }
      break;

    case 'spamtag':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );
        try {
          const teks = m.text.slice(m.text.indexOf(' ') + 1).trim(); // potong 'spamtag'

          if (!teks.includes('|'))
            return m.reply('❌ Format salah. Contoh:\nspamtag Halo @628xxx|10');

          const [rawMsg, countRaw] = teks.split('|');
          const count = parseInt(countRaw.trim());

          if (isNaN(count) || count <= 0)
            return m.reply('❌ Jumlah harus berupa angka lebih dari 0.');

          const mentionNumbers = [...rawMsg.matchAll(/@(\d{5,20})/g)].map(
            (match) => `${match[1]}@s.whatsapp.net`,
          );

          if (mentionNumbers.length === 0)
            return m.reply('❌ Tidak ada mention @nomor ditemukan dalam teks.');

          for (let i = 0; i < count; i++) {
            await conn.sendMessage(m.chat, {
              text: rawMsg,
              mentions: mentionNumbers,
            });
            await new Promise((resolve) => setTimeout(resolve, 300)); // jeda 300ms agar aman
          }

          m.reply(`✅ Berhasil kirim spam tag sebanyak ${count}x.`);
        } catch (err) {
          m.reply(`❌ Gagal spam tag: ${err.message}`);
        }
      }
      break;

    case 'get':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );
        try {
          const url = m.text.split(' ')[1];

          if (!url || !/^https?:\/\//.test(url)) {
            return m.reply('❌ Format salah. Contoh:\nget https://example.com');
          }

          const protocol = url.startsWith('https')
            ? require('https')
            : require('http');

          protocol
            .get(url, (res) => {
              let data = '';

              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                const responseText =
                  data.length > 2000
                    ? data.slice(0, 2000) +
                      '\n\n❗ Output terlalu panjang, dipotong.'
                    : data;

                m.reply(`✅ Response dari:\n${url}\n\n` + responseText);
              });
            })
            .on('error', (err) => {
              m.reply(`❌ Error: ${err.message}`);
            });
        } catch (err) {
          m.reply(`❌ Gagal fetch URL: ${err.message}`);
        }
      }
      break;

    case 'hidetag':
    case 'ht':
      {
        if (!m.isGroup) return m.reply('❌ Hanya bisa digunakan di grup.');
        if (!m.isOwner) return null;

        const text = m.text.split(' ').slice(1).join(' ');
        if (!text)
          return m.reply(
            '❌ Masukkan teks untuk dikirim.\nContoh:\n.ht Halo semua!',
          );

        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants
          .map((p) => p.id)
          .filter((id) => id.endsWith('@s.whatsapp.net'));

        await conn.sendMessage(
          m.chat,
          {
            text: `*[Hidetag Message by @${m.sender.split('@')[0]}]*\n\n${text}`,
            mentions: participants,
          },
          { quoted: m },
        );
      }
      break;

    case 'git':
      {
        const { spawn } = require('child_process');
        const https = require('https');
        const { pipeline } = require('stream');
        const archiver = require('archiver');
        const path = require('path');

        const url = m.text.split(' ')[1];
        if (!url || !url.startsWith('http') || !url.includes('.git')) {
          return m.reply(
            '❌ Format salah. Contoh:\n.git https://github.com/user/repo.git',
          );
        }

        const repoName = url.split('/').pop().replace('.git', '');
        const tempDir = `./tmp-${Date.now()}`;
        const zipPath = `${tempDir}.zip`;

        m.reply('⏳ Cloning repository...');

        // Clone repo
        const git = spawn('git', ['clone', url, tempDir]);
        git.on('close', async (code) => {
          if (code !== 0) return m.reply('❌ Gagal clone repository.');

          // Zip folder
          const archive = archiver('zip', { zlib: { level: 9 } });
          const fs = require('fs');
          const output = fs.createWriteStream(zipPath);

          archive.pipe(output);
          archive.directory(tempDir, false);
          await archive.finalize();

          output.on('close', async () => {
            await conn.sendMessage(
              m.chat,
              {
                document: fs.readFileSync(zipPath),
                mimetype: 'application/zip',
                fileName: `${repoName}.zip`,
              },
              { quoted: m },
            );

            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });
            fs.unlinkSync(zipPath);
          });
        });
      }
      break;

    case 'reactch':
    case 'rch':
      {
        if (!m.text.includes('https://whatsapp.com/channel/'))
          return m.reply(
            '⚠️ Format salah!\nContoh:\n.reactch https://whatsapp.com/channel/xxx halo dunia',
          );

        const hurufGaya = {
          a: '🅐',
          b: '🅑',
          c: '🅒',
          d: '🅓',
          e: '🅔',
          f: '🅕',
          g: '🅖',
          h: '🅗',
          i: '🅘',
          j: '🅙',
          k: '🅚',
          l: '🅛',
          m: '🅜',
          n: '🅝',
          o: '🅞',
          p: '🅟',
          q: '🅠',
          r: '🅡',
          s: '🅢',
          t: '🅣',
          u: '🅤',
          v: '🅥',
          w: '🅦',
          x: '🅧',
          y: '🅨',
          z: '🅩',
          0: '⓿',
          1: '➊',
          2: '➋',
          3: '➌',
          4: '➍',
          5: '➎',
          6: '➏',
          7: '➐',
          8: '➑',
          9: '➒',
        };

        const [_, link, ...pesan] = m.text.split(' ');
        const emojiRaw = pesan.join(' ').toLowerCase();
        const emoji = emojiRaw
          .split('')
          .map((c) => (c === ' ' ? '―' : hurufGaya[c] || c))
          .join('');

        try {
          const channelId = link.split('/')[4];
          const messageId = link.split('/')[5];

          const meta = await conn.newsletterMetadata('invite', channelId);
          await conn.newsletterReactMessage(meta.id, messageId, emoji);

          m.reply(
            `✅ Berhasil react *${emoji}* ke pesan di channel *${meta.name}*.`,
          );
        } catch (e) {
          console.log('❌ Gagal react:', e);
          m.reply('❌ Gagal react, cek link dan isi pesanmu!');
        }
      }
      break;

    case 'antitagsw':
    case 'atsw':
      if (!m.isOwner)
        return m.reply(
          'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
        );
      {
        if (!m.isGroup) return m.reply('❌ Fitur ini hanya untuk grup!');

        const arg = m.text.split(' ')[1];
        if (!['true', 'false'].includes(arg))
          return m.reply('⚠️ Format salah!\nContoh:\n.antitagsw true');

        const fiturAktif = await cekToggleGroup(m.chat, 'antitagsw');

        if (arg === 'true') {
          if (fiturAktif)
            return m.reply(
              '✅ Fitur *Anti Tag Story WA* sudah aktif di grup ini.',
            );
          await toggleGroupStatus(m.chat, 'antitagsw');
          return m.reply('✅ Fitur *Anti Tag Story WA* berhasil diaktifkan.');
        } else {
          if (!fiturAktif)
            return m.reply(
              '✅ Fitur *Anti Tag Story WA* sudah nonaktif di grup ini.',
            );
          await toggleGroupStatus(m.chat, 'antitagsw');
          return m.reply(
            '✅ Fitur *Anti Tag Story WA* berhasil dinonaktifkan.',
          );
        }
      }
      break;

    case 'tt':
    case 'tiktok':
      {
        let url = m.text.split(' ')[1];
        if (!url)
          return m.reply(
            '❌ Masukkan link TikTok!\nContoh: .tt https://vt.tiktok.com/xxxx',
          );
        if (!url.includes('tiktok.com'))
          return m.reply('❌ Link harus dari TikTok!');

        try {
          const axios = require('axios');
          const res = await axios.get(
            `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
          );
          const data = res.data;

          if (!data || !data.data || !data.data.play)
            return m.reply('❌ Gagal mendapatkan video.');

          const { title, author, music, play, cover, duration } = data.data;

          const caption = `🎬 ${title}\n👤 Author: @${author.unique_id}\n🕒 Durasi: ${duration}s`;

          await conn.sendMessage(
            m.chat,
            {
              video: { url: play },
              caption: caption,
            },
            { quoted: m },
          );
        } catch (err) {
          console.error(err);
          m.reply('❌ Gagal mengunduh video TikTok.');
        }
      }
      break;

    case 'listgc':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );
        try {
          let data = await conn.groupFetchAllParticipating();
          let list = Object.values(data)
            .map((v, i) => `*${i + 1}.* ${v.subject}\nID: ${v.id}`)
            .join('\n\n');

          if (!list) return m.reply('❌ Bot tidak join grup manapun.');

          let total = list.split('\n\n').length;
          m.reply(`📜 *Daftar Grup (${total} total)*\n\n${list}`);
        } catch (e) {
          console.error(e);
          m.reply('❌ Gagal mengambil daftar grup.');
        }
      }
      break;

    case 'bc':
    case 'broadcast':
      {
        if (!m.isOwner) return m.reply('❌ Hanya owner yang bisa broadcast.');
        if (!m.quoted) return m.reply('⚠️ Reply pesan yang mau di-broadcast.');

        try {
          const allGroups = await conn.groupFetchAllParticipating();
          const groupIds = Object.keys(allGroups);

          m.reply(`📢 Sedang broadcast ke ${groupIds.length} grup...`);

          const content = m.quoted.conversation;

          for (let id of groupIds) {
            try {
              conn.sendMessage(id, {
                text: content || '📢 Broadcast',
                contextInfo: { isForwarded: true, forwardingScore: 999 },
              });
              // delay biar aman
            } catch (err) {}
          }

          m.reply('✅ Broadcast selesai.');
        } catch (err) {
          console.error(err);
          m.reply(`❌ Gagal broadcast. ${err}`);
        }
      }
      break;

    case 'delproduk':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );

        let code = m.text.split(' ')[1];
        if (!code)
          return m.reply(
            'Penggunaan:\n`.delproduk <code>`\nContoh: `.delproduk DO10VCC`',
          );

        if (!Array.isArray(config.payment.stok)) {
          config.payment.stok = [];
        }

        let produkIndex = config.payment.stok.findIndex((p) => p.id === code);
        if (produkIndex === -1)
          return m.reply(`Produk dengan code "${code}" tidak ditemukan.`);

        let removed = config.payment.stok.splice(produkIndex, 1)[0];

        try {
          fs.writeFileSync(
            './config.json',
            JSON.stringify(config, null, 4),
            'utf8',
          );
          m.reply(
            `🗑️ Produk berhasil dihapus:\n\n📦 Code: ${removed.id}\n📛 Nama: ${removed.nama}`,
          );
        } catch (err) {
          m.reply(`Gagal menyimpan konfigurasi: ${err}`);
        }
      }
      break;

    case 'addproduk':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );

        let arg = m.text.split(' ').slice(1).join(' ').split('|');
        let code = arg[0]?.trim();
        let nama = arg[1]?.trim();
        let harga = parseInt(arg[2]);
        let deskripsi = arg[3]?.trim();

        if (!code || !nama || isNaN(harga) || !deskripsi)
          return m.reply(
            'Penggunaan\n`.addproduk <code>|<nama>|<harga>|<deskripsi>`\nContoh:\n`.addproduk DO10VCC|Digitalocean 10 Drop VCC|150000|Digitalocean 10 Drop 2 Bulan`',
          );

        if (harga <= 0) return m.reply('Harga harus lebih besar dari 0');

        let produklist = [];
        try {
          produklist = config.payment.stok || [];
        } catch (err) {
          return m.reply(`Gagal membaca stok produk: ${err}`);
        }

        let isProdukExist = produklist.find((p) => p.id === code);
        if (isProdukExist)
          return m.reply(
            'Produk sudah ada. Jika ingin menambahkan ulang, hapus produk tersebut terlebih dahulu.',
          );

        let newProduk = {
          id: code,
          nama: nama,
          harga: harga,
          deskripsi: deskripsi,
          terjual: 0,
          stok: [],
        };

        produklist.push(newProduk);
        config.payment.stok = produklist;

        try {
          fs.writeFileSync(
            './config.json',
            JSON.stringify(config, null, 4),
            'utf8',
          );
          m.reply(
            `✅ Produk berhasil ditambahkan:\n\n📦 Code: ${code}\n📛 Nama: ${nama}\n💰 Harga: ${harga}\n📝 Deskripsi: ${deskripsi}`,
          );
        } catch (err) {
          m.reply(`Gagal menyimpan konfigurasi: ${err}`);
        }
      }
      break;

    case 'listproduk':
      {
        if (
          !Array.isArray(config.payment.stok) ||
          config.payment.stok.length === 0
        )
          return m.reply('📭 Belum ada produk yang tersedia.');

        let teks = `🛍️ *DAFTAR PRODUK TERSEDIA*\n\n`;
        for (let [i, p] of config.payment.stok.entries()) {
          teks += `🆔 *${p.id}*\n`;
          teks += `📛 *${p.nama}*\n`;
          teks += `💰 *Rp ${p.harga.toLocaleString()}*\n`;
          teks += `📦 *Ready:* ${p.stok?.length ?? 0} | *Terjual:* ${p.terjual ?? 0}\n`;
          teks += `📝 *Deskripsi:* ${p.deskripsi}\n`;
          teks += `────────────────────\n`;
        }
        m.reply(teks);
      }
      break;
    case 'addstok':
      {
        if (!m.isOwner) return m.reply('Lu bukan bosnya di sini 🫵');

        let inputText = m.text.split(' ').slice(1).join(' '); // ambil teks setelah .addstok
        let parts = inputText
          .split(',')
          .map((x) => x.trim())
          .filter((x) => x.includes('|'));

        if (parts.length === 0)
          return m.reply(
            'Format salah!\nContoh:\n.addstok DO10VCC|user1|pass1|2fa|note,user2|pass2|2fa|note2',
          );

        let [code, ...firstStokParts] = parts[0].split('|');
        let stokList = [firstStokParts.join('|'), ...parts.slice(1)];

        if (!code) return m.reply('Code produk tidak ditemukan di input.');

        if (!Array.isArray(config.payment.stok)) config.payment.stok = [];

        let produk = config.payment.stok.find((p) => p.id === code);
        if (!produk)
          return m.reply(`Produk dengan code "${code}" tidak ditemukan.`);

        produk.stok = produk.stok || [];
        produk.stok.push(...stokList);

        try {
          fs.writeFileSync(
            './config.json',
            JSON.stringify(config, null, 4),
            'utf8',
          );
          m.reply(
            `✅ Berhasil menambahkan ${stokList.length} stok ke produk "${produk.nama}"`,
          );
        } catch (err) {
          m.reply(`❌ Gagal menyimpan data: ${err}`);
        }
      }
      break;
    case 'buy':
      {
        if (typeof processpayment !== 'function')
          return m.reply('❌ Fungsi `processpayment` tidak ditemukan.');

        let [cmd, code, jumlahStr] = m.text.trim().split(' ');
        let jumlah = parseInt(jumlahStr);

        if (!code || isNaN(jumlah) || jumlah <= 0)
          return m.reply(
            'Penggunaan:\n`.buy <code> <jumlah>`\nContoh: `.buy DO10VCC 2`',
          );

        let produk = config.payment.stok.find((p) => p.id === code);
        if (!produk)
          return m.reply(`❌ Produk dengan code "${code}" tidak ditemukan.`);

        if (!Array.isArray(produk.stok) || produk.stok.length < jumlah)
          return m.reply(
            `❌ Stok tidak cukup. Tersedia hanya *${produk.stok?.length || 0}* item.`,
          );

        let totalHarga = produk.harga * jumlah;
        await m.reply(
          `💰 Total: *Rp ${totalHarga.toLocaleString()}*\n⏳ Menunggu pembayaran...`,
        );

        let status = await processpayment(totalHarga);
        if (!status) return m.reply('❌ Pembayaran dibatalkan atau gagal.');

        let akunTerjual = produk.stok.splice(0, jumlah);
        produk.terjual += jumlah;

        try {
          fs.writeFileSync(
            './config.json',
            JSON.stringify(config, null, 4),
            'utf8',
          );
        } catch (err) {
          return m.reply(`❌ Gagal menyimpan data produk: ${err}`);
        }

        let isi = `🧾 *Pembelian Produk: ${produk.nama}*\nJumlah: ${jumlah} akun\n\n`;
        akunTerjual.forEach((data, i) => {
          let [u, p, f, c] = data.split('|');
          isi += `#${i + 1}\n👤 Username: ${u}\n🔐 Password: ${p}\n🔑 2FA: ${f}\n📝 Catatan: ${c}\n\n`;
        });

        let path = `/tmp/buy_${code}_${Date.now()}.txt`;
        fs.writeFileSync(path, isi);

        m.reply(
          {
            document: { url: path },
            mimetype: 'text/plain',
            fileName: `Akun_${code}.txt`,
          },
          { quoted: m },
        );
      }
      break;

    case 'bash':
    case '$':
      {
        if (!m.isOwner)
          return m.reply(
            'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
          );
        if (!m.quoted && !m.text.split(' ')[1])
          return m.reply('💻 Masukkan perintah bash.\nContoh: `$ ls -la`');

        const { spawn } = require('child_process');
        const cmd = m.quoted?.text || m.text.slice(1).trim();
        const [command, ...args] = cmd.split(' ');

        const ps = spawn(command, args);

        let stdout = '';
        let stderr = '';

        ps.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        ps.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        ps.on('close', (code) => {
          if (stderr) return m.reply(`⚠️ Error:\n${stderr}`);
          if (!stdout.trim()) return m.reply('✅ Berhasil, tanpa output.');
          if (stdout.length > 4000)
            return m.reply('📦 Output terlalu panjang untuk dikirim.');
          m.reply(`📤 Output:\n\n${stdout.trim()}`);
        });

        ps.on('error', (err) => {
          m.reply(`❌ Gagal menjalankan perintah:\n${err.message}`);
        });
      }
      break;

    case 'eval':
    case '>':
      if (!m.isOwner)
        return m.reply(
          'Maaf raja, ini bukan buat lu, coba main ke tempat lain aja.',
        );

      // Ambil semua teks setelah prefix, misal '> console.log("hai")'
      let teks = m.text.trim().slice(1).trim(); // Buang karakter pertama '>' lalu trim spasi
      if (!teks) return m.reply(`Contoh: > m.reply("sigma")`);

      try {
        let hasil = await eval(`(async () => { return ${teks} })()`); // Biar support async
        if (typeof hasil !== 'string') {
          hasil = require('util').inspect(hasil, { depth: 1 });
        }
        m.reply(hasil);
      } catch (err) {
        m.reply('❌ Error:\n' + err);
      }
      break;

    case 'gitpush':
      {
        if (!m.isOwner) return m.reply('Maaf raja, ini bukan buat lu.');

        (async () => {
          const fs = require('fs');
          const path = require('path');
          const simpleGit = require('simple-git');
          const git = simpleGit();

          const config = require('./config.json');
          const GITHUB_TOKEN = config.github.yourToken;
          const GITHUB_USER = config.github.username;
          const REPO_NAME = config.github.yourRepo;
          const BRANCH = 'main';
          const GITHUB_URL = `https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git`;

          const commitMsg = m.text.split(' ').slice(1).join(' ').trim();
          if (!commitMsg)
            return m.reply(
              '❌ Masukkan commit message.\nContoh: .gitpush update fitur baru',
            );

          const IGNORED = [
            'node_modules',
            'package-lock.json',
            'config.json',
            '.git',
            'session',
          ];

          // === Ambil semua file secara rekursif ===
          function getAllFiles(dir, baseDir = dir) {
            let results = [];
            const list = fs.readdirSync(dir);
            for (const file of list) {
              const fullPath = path.join(dir, file);
              const relPath = path
                .relative(baseDir, fullPath)
                .replace(/\\/g, '/');

              if (
                IGNORED.some(
                  (ignore) =>
                    relPath === ignore || relPath.startsWith(ignore + '/'),
                )
              )
                continue;

              const stat = fs.statSync(fullPath);
              if (stat && stat.isDirectory()) {
                results = results.concat(getAllFiles(fullPath, baseDir));
              } else {
                results.push(relPath);
              }
            }
            return results;
          }

          try {
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
              await git.init();
              await git.addRemote('origin', GITHUB_URL);
            } else {
              await git.remote(['set-url', 'origin', GITHUB_URL]);
            }

            const filesToAdd = getAllFiles('.');
            if (!filesToAdd.length)
              return m.reply('❌ Tidak ada file yang bisa di-push.');

            await git.add(filesToAdd);
            await git.commit(commitMsg);
            await git.push(['-f', 'origin', BRANCH]);

            m.reply(
              `✅ Berhasil *force push* ${filesToAdd.length} file ke GitHub dengan commit:\n\n📦 ${commitMsg}`,
            );
          } catch (err) {
            m.reply(`❌ Gagal push: ${err.message}`);
          }
        })();
      }
      break;
  }
};
