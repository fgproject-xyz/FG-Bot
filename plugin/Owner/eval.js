module.exports = {
    name: ">",
    fullnm: "Eval Code",
    permission: "owner",
    description: "Evaluasi kode JavaScript",
    tag: "Owner",
    async run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        try {
            const code = isipesan.slice(1).trim(); // Hilangkan ">" dan spasi
            if (!code) return reply("⚠️ Tidak ada kode untuk dieksekusi.");

            let hasil = await eval(code);

            // Jika hasil bukan string, konversi jadi string
            if (typeof hasil !== "string") {
                hasil = require("util").inspect(hasil, { depth: 1 });
            }
                reply("a" + "\n\n" + hasil);
            
        } catch (err) {
            reply("❌ Error:\n\n" + err.toString());
        }
    }
};

