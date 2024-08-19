const fs = require('fs');

function getIpProxy(page = '') {
    const PATH_FILE_TEMP_PROXY = './temp-proxy.txt';

    let proxiesDefault = [];
    if (page == '') {
        // IP ALL LOCATION 
        proxiesDefault = [
            '38.152.170.53:8800',
            '38.152.170.142:8800',
            '38.153.176.79:8800',
            '38.153.176.237:8800',
            '192.126.155.147:8800',
            '192.126.155.9:8800',
            '192.126.207.219:8800',
            '192.126.207.97:8800',
            '192.126.155.169:8800',
            '192.126.155.182:8800',
        ];
    } else {
        // IP LOCATION JP
        // proxiesDefault = [
        //     '87.101.81.110:8800',
        //     '87.101.81.171:8800',
        //     '87.101.81.227:8800',
        //     '87.101.80.149:8800',
        //     '87.101.81.101:8800',
        //     '87.101.80.250:8800',
        // ];
    }

    const proxies = [...proxiesDefault];
    let nextIp = null;

    return new Promise((resolve, reject) => {
        fs.readFile(PATH_FILE_TEMP_PROXY, 'utf8', (err, data) => {
            if (err) {
                console.log('Error reading temp proxy file:', err);
                reject(err);
                return;
            }

            let tempProxies = data.split("\n").filter(Boolean);
            let availableProxies = proxies.filter(ip => !tempProxies.includes(ip));

            if (availableProxies.length == 0) {
                fs.writeFile(PATH_FILE_TEMP_PROXY, "", (err) => {
                    if (err) {
                        console.log('Error clearing temp proxy file:', err);
                        reject(err);
                        return;
                    }
                });

                availableProxies = proxies;
            }

            nextIp = availableProxies.sort(() => 0.5 - Math.random()).pop();
            fs.appendFile(PATH_FILE_TEMP_PROXY, nextIp + "\n", (err) => {
                if (err) {
                    console.log('Error appending temp proxy file:', err);
                    reject(err);
                    return;
                }

                resolve(nextIp);
            });
        });
    });
}