const DefaultSettings = {
    "enabled": true,
    "DefaultItemSpawn":      98260, // 默认提示物 98260 ---古龍貝勒古斯的頭
    "UseJobSpecificMarkers": false, // 按职业分类
    "JobSpecificMarkers": [
        {jobs: 1,  marker: 88631}, // 枪骑 --- 初始面具 力量
        {jobs: 10, marker: 88632}, // 拳师 --- 初始面具 暴击
        {jobs: 6,  marker: 88633}, // 祭祀 --- 初始面具 暴威
        {jobs: 7,  marker: 88634}, // 元素 --- 初始面具 冷却
    ]
};

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings;
    } else {
        // Migrate from older version (using the new system) to latest one
        if (from_ver + 1 < to_ver) { // Recursively upgrade in one-version steps
            settings = MigrateSettings(from_ver, from_ver + 1, settings);
            return MigrateSettings(from_ver + 1, to_ver, settings);
        }
        // If we reach this point it's guaranteed that from_ver === to_ver - 1, so we can implement
        // a switch for each version step that upgrades to the next version. This enables us to
        // upgrade from any version to the latest version without additional effort!
        switch (to_ver) {
            default:
                let oldsettings = settings
                settings = Object.assign(DefaultSettings, {});
                for (let option in oldsettings) {
                    if (settings[option]) {
                        settings[option] = oldsettings[option]
                    }
                }
                break;
        }
        return settings;
    }
}
