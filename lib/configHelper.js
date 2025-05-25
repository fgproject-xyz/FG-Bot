const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config.json');
let config = require(configPath);

function getUserInfo(pelaku) {
    const isOwner = config.owner === pelaku;
    const isPremium = config.db.isPremium.includes(pelaku);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    return {
        isOwner,
        isPremium
    };
}

module.exports = {
    getUserInfo
};
