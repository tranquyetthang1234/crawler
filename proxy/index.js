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

module.exports = getIpProxy;