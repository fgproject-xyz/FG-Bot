const { spawn } = require('child_process');

module.exports = {
    name: "$",
    fullnm: "Bash Emulator",
    permission: "owner",
    description: "Perintah Bash",
    tag: "Owner",
    async run(pelaku, isipesan, typepesan, messages, trueDragon, reply, owner) {
        const command = isipesan.slice(2).trim(); // Ambil semua setelah "$ "
        if (!command) {
            reply("❌ Perintah kosong.");
            return;
        }

        // Pisahkan perintah dan argumen
        const args = command.split(' ');
        const cmd = args.shift();

        const proc = spawn(cmd, args, { shell: true });

        let output = '';

        proc.stdout.on('data', data => {
            output += data.toString();
        });

        proc.stderr.on('data', data => {
            output += data.toString();
        });

        proc.on('close', code => {
            if (!output.trim()) {
                reply(`✅ Perintah selesai dengan kode ${code}, tanpa output.`);
            } else {
                reply(`✅ Output (kode ${code}):\n\n${output.trim()}`);
            }
        });

        proc.on('error', err => {
            reply(`❌ Gagal menjalankan perintah:\n\n${err.message}`);
        });
    }
};

