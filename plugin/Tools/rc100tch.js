const hurufGaya = {
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
    h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
    o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
    v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
    '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
    '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

module.exports = {
    name: "rc100tch",
    permission: "owner",
    fullnm: "React CH 11 Pesan",
    tag: "Owner",
    aliases: [],
    async run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        const args = isipesan.trim().split(" ");
        const link = args[1];

        if (!link || !link.startsWith("https://whatsapp.com/channel/")) {
            return reply("⚠️ Format salah!\nContoh: .rc100tch https://whatsapp.com/channel/xxx halo dunia");
        }

        const emojiInput = args.slice(2).join(' ').toLowerCase();
        const emoji = emojiInput.split('').map(c => {
            if (c === ' ') return '―';
            return hurufGaya[c] || c;
        }).join('');

        try {
            const channelId = link.split('/')[4];
            const messageId = parseInt(link.split('/')[5]);
            if (isNaN(messageId)) return reply("❌ ID pesan tidak valid!");

            const metadata = await trueDragon.newsletterMetadata("invite", channelId);

            let success = 0;
            let failed = 0;
            const start = messageId;
            const end = messageId - 99;

            for (let id = start; id >= end; id--) {
                try {
                    await trueDragon.newsletterReactMessage(metadata.id, id.toString(), emoji);
                    success++;
                } catch {
                    failed++;
                }
            }

            return reply(`✅ Reaction *${emoji}* dikirim ke ${success} pesan.\n❌ Gagal pada ${failed} pesan.`);
        } catch (err) {
            console.error(err);
            return reply("❌ Gagal menjalankan perintah. Cek link & emoji.");
        }
    }
}


