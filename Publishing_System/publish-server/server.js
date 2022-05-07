let http = require('http');
// let fs = require('fs');
let unzipper = require('unzipper');

http.createServer(function (request, response) {
    console.log("request")
    // let outFile = fs.createWriteStream("../server/public/index.html");
    // let outFile = fs.createWriteStream("../server/public/temp.zip");
    // request.pipe(outFile);
    request.pipe(unzipper.Extract({ path: '../server/public/' }))
    // request.on('data', chunk => {
    //     outFile.write(chunk);
    // })
    // request.on("end", () => {
    //     outFile.end();
    //     response.end("success");
    // })

}).listen(8082);