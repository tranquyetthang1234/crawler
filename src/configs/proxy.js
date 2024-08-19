import fs from "fs";

const PATH_FILE_TEMP_PROXY = './src/public/proxy/temp_proxy.txt';

function getIpProxy (page = '') {

    let proxiesDefault = [];
    if (page == '') {
        // IP ALL LOCATION 
        proxiesDefault = [
            // '38.152.170.53:8800',
            // '38.152.170.142:8800',
            // '38.153.176.79:8800',
            // '38.153.176.237:8800',
            '192.126.155.147:8800',
            '192.126.155.9:8800',
            '192.126.207.219:8800',
            '192.126.207.97:8800',
            '192.126.155.169:8800',
            '192.126.155.182:8800'
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

    const proxies = [ ...proxiesDefault];
    let nextIp = null;

    try {  
        let tempProxies = fs.readFileSync(PATH_FILE_TEMP_PROXY, 'utf8').split("\n").filter(Boolean);
        let availableProxies = proxies.filter(ip => !tempProxies.includes(ip));

        if (availableProxies.length == 0) {
            fs.writeFile(PATH_FILE_TEMP_PROXY, "", (err) => {
                if (err) console.log('Error clearing temp proxy file:', err);
            });
            
            availableProxies = proxies;
        }

        nextIp = availableProxies.sort(() => 0.5 - Math.random()).pop();
        fs.appendFile(PATH_FILE_TEMP_PROXY, nextIp + "\n", (err) => {
            if (err) console.log('Error appending temp proxy file:', err);
        });
        
    } catch(e) {
        console.log('Error get proxy IP:', e);
    }

    return nextIp;
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

export default  {
    getIpProxy,
    getUserAgents
}
