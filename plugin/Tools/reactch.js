const hurufGaya = {
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
    h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
    o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
    v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
    '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
    '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

module.exports = {
    name: "reactch",
    permission: "public",
    fullnm: "React CH",
    tag: "Channel",
    async run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        const args = isipesan.split(" ");
        const link = args[1];

        if (!link || !link.startsWith("https://whatsapp.com/channel/")) {
            return reply("⚠️ Format salah!\nContoh: .reactch https://whatsapp.com/channel/xxx halo dunia");
        }

        const emojiInput = args.slice(2).join(' ').toLowerCase();
        const emoji = emojiInput.split('').map(c => {
            if (c === ' ') return '―';
            return hurufGaya[c] || c;
        }).join('');

        try {
            const channelId = link.split('/')[4];
            const messageId = link.split('/')[5];

            const metadata = await trueDragon.newsletterMetadata("invite", channelId);
            await trueDragon.newsletterReactMessage(metadata.id, messageId, emoji);

            return reply(`✅ Berhasil mengirim reaction *${emoji}* ke pesan di channel *${metadata.name}*.`);
        } catch (err) {
            console.error(err);
            return reply("❌ Gagal mengirim reaction. Periksa link dan format emoji.");
        }
    }
}

