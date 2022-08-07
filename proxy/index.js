const fs = require('fs')
const PATH_FILE_TEM_PROXY = './proxy/temp_proxy.txt';

function getIpProxy () {

    const proxiesDefault = [
        '152.89.130.236:8800',
        '23.254.122.227:8800',
        '185.222.37.19:8800',
        '23.254.122.97:8800',
        '104.144.47.182:8800',
        '23.254.122.123:8800',
        '104.144.47.9:8800',
        '23.254.122.125:8800',
        '185.222.37.83:8800',
        '152.89.130.7:8800'
    ];

    const listProxies = [ ...proxiesDefault];
    let arrTempProxies = [];
    let compareArray = [];
    let ip = '';
    try {  
        let tempProxies = fs.readFileSync(PATH_FILE_TEM_PROXY, 'utf8');
        arrTempProxies = tempProxies.split("\n")
        compareArray = listProxies.filter(ip => !arrTempProxies.includes(ip));
        if (compareArray && compareArray.length == 0) {
            fs.writeFile(PATH_FILE_TEM_PROXY, "", (err) => {
                if (err) return console.log(err);
            });
            
            compareArray = proxiesDefault;
        }

        ip = compareArray.sort(() => 0.5 - Math.random()).pop();
        fs.appendFile(PATH_FILE_TEM_PROXY, ip + "\n", (err) => {
            if (err) return console.log(err);
        });
        
    } catch(e) {
        console.log('Error get proxy IP:', e);
    }

    return ip;
}

function getUserAgents() {
    let useAgents = [
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/8.0.8 Safari/600.8.9",
        "Mozilla/5.0 (iPad; CPU OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12H321 Safari/600.1.4",
        "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240",
        "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0",
        "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko",
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
        "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/600.7.12 (KHTML, like Gecko) Version/8.0.7 Safari/600.7.12",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/7.1.8 Safari/537.85.17",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
    ];

    const randomUseAgents = useAgents[Math.floor(Math.random() * useAgents.length)];

    return randomUseAgents;
}

module.exports.getIpProxy = getIpProxy;
module.exports.getUserAgents = getUserAgents;