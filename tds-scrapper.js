var cheerio = require('cheerio');
var request = require("request");
var fs = require('fs');
var stmtFiling = 0;
var tdsCertificate = 0;
var advisoryComm = 0;
var demandFollowup = 0;

request({
    uri: "http://contents.tdscpc.gov.in/en/tdscpc-communication.html#",
    method: 'GET',
    headers: {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36',
        'Accept-Encoding': 'sdch',
        'Accept-Language': 'en-US,en;q=0.8',
        'If-Modified-Since': 'Wed, 15 May 2014 11:41:02 GMT'
    }
}, scrape);

function scrape(error, response, body) {

    fs.readFileSync('./scrapper.ini').toString().split('\n').forEach(function (line) {
        var data = line.split("=");
        if (data[0].trim() === 'demand.followup') {
            demandFollowup = parseInt(data[1]);
        } else if (data[0].trim() === 'advisory.commnunication') {
            advisoryComm = parseInt(data[1]);
        } else if (data[0].trim() === 'tds.stmt.filing') {
            stmtFiling = parseInt(data[1]);
        } else if (data[0].trim() === 'tds.download.certi') {
            tdsCertificate = parseInt(data[1]);
        }
    });

    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);

        //#Accordion1Content > table
        var self = this;
        self.stmtFilingJson = [];
        self.tdsCertificateJson = [];
        self.advisoryCommJson = [];
        self.demandFollowupJson = [];
        self.topStmtFiling = [];
        self.toptdsCertificate = [];
        self.topadvisoryComm = [];
        self.topdemandFollowup = [];


        $('#Accordion1Content > table > tr').each(function (index, value) {
            var k = this.children;
            var num = k[1].children[0].data;
            if (!isNaN(num)) {
                self.topStmtFiling.push(num);
                if (parseInt(k[1].children[0].data) > stmtFiling) {
                    var data = {};
                    data[k[3].children[0].data] = "http://contents.tdscpc.gov.in/en/" + k[5].children[0].attribs.href;
                    self.stmtFilingJson.push(data);
                }
            }
        });
        $('#Accordion2Content > table > tr').each(function (index, value) {
            var k = this.children;
            var num = k[1].children[0].data;
            if (!isNaN(num)) {
                self.topadvisoryComm.push(num);
                if (parseInt(k[1].children[0].data) > advisoryComm) {
                    var data = {};
                    data[k[3].children[0].data] = "http://contents.tdscpc.gov.in/en/" + k[5].children[0].attribs.href;
                    self.advisoryCommJson.push(data);
                }
            }
        });
        $('#Accordion3Content > table > tr').each(function (index, value) {
            var k = this.children;
            var num = k[1].children[0].data;
            if (!isNaN(num)) {
                self.toptdsCertificate.push(num);
                if (parseInt(k[1].children[0].data) > tdsCertificate) {
                    var data = {};
                    data[k[3].children[0].data] = "http://contents.tdscpc.gov.in/en/" + k[5].children[0].attribs.href;
                    self.tdsCertificateJson.push(data);
                }
            }
        });
        $('#Accordion4Content > table > tr').each(function (index, value) {
            var k = this.children;
            var num = k[1].children[0].data;
            if (!isNaN(num)) {
                self.topdemandFollowup.push(num);
                if (parseInt(k[1].children[0].data) > demandFollowup) {
                    var data = {};
                    data[k[3].children[0].data] = "http://contents.tdscpc.gov.in/en/" + k[5].children[0].attribs.href;
                    self.demandFollowupJson.push(data);
                }
            }
        });
        console.log(self.stmtFilingJson);
        console.log(self.advisoryCommJson);
        console.log(self.demandFollowupJson);
        console.log(self.tdsCertificateJson);

        var buffer = "";
        buffer += "demand.followup=" + Math.max.apply(Math, self.topdemandFollowup) + "\n";
        buffer += "advisory.commnunication=" + Math.max.apply(Math, self.topadvisoryComm) + "\n";
        buffer += "tds.stmt.filing=" + Math.max.apply(Math, self.topStmtFiling) + "\n";
        buffer += "tds.download.certi=" + Math.max.apply(Math, self.toptdsCertificate) + "\n";

        fs.open('./scrapper.ini', 'w', function (err, fd) {
            if (err) {
                throw 'error opening file: ' + err;
            } else {
                fs.write(fd, buffer, 0, buffer.length, null, function (err) {
                    if (err) throw 'error writing file: ' + err;
                    fs.close(fd, function () {
                        console.log('file written');
                    })
                });
            }
        });
    }
}
