const axios = require('axios');
const fs = require('fs');

let isFinish = false;
const pageSize = 20;

const testUrl = 'https://huaban.com/boards/46589133/';

let originUrl = '';

async function getPageData(url) {
    const res = await axios.get(url, {
        headers: {
            'X-Request': 'JSON',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
    const data = res.data;
    const folderName = data.board.title;
    const path = `images/${folderName}`;
    const urlList = data.board.pins.map(item => item.file.key);
    const pinsCount = data.board.pins.length;
    fs.mkdir(path, (err) => {

        if (err && err.code !== 'EEXIST') {
            throw err;
        }
        getAndSaveImage(urlList, path);

        if (pinsCount < pageSize) {
            return;
        } else {
            max = data.board.pins[pinsCount - 1].pin_id;
            url = `${originUrl}?max=${max}&limit=${pageSize}`;
            getPageData(url);
        }
    });
}

function getAndSaveImage(list, path) {
    list.forEach(item => {
        axios.get(`https://hbimg.huabanimg.com/${item}`, {
            responseType: "arraybuffer",
        }).then(res => {
            fs.writeFile(`${path}/${item}.jpg`, res.data, "binary", function (err) {
                if (err) {
                    console.log('TCL: main -> err', err);
                } else {
                    console.log(`${item}保存成功`);
                }
            });
        })
    })
}

async function main() {
    originUrl = process.argv[2];
    let data = await getPageData(originUrl);
}

main();
