const xml2js = require('xml2js');
const fs = require('fs');
const utils = require('./utils');

if(require.main === module) {
    (async () => {
        if(process.argv.length < 3) {
            console.error('please supply the path to the SVG to patch');
            process.exit(1);
        }

        const file = fs.readFileSync(process.argv[2]);
        const parsedFile = await xml2js.parseStringPromise(file);
        const viewBox = parsedFile.svg['$'].viewBox;
        const viewBoxParts = viewBox.split(' ');
        parsedFile.svg['$'].width = utils.pointToMm(parseInt(viewBoxParts[2], 10)) + 'mm';
        parsedFile.svg['$'].height = '128.5mm';

        const builder = new xml2js.Builder();
        fs.writeFileSync(process.argv[2], builder.buildObject(parsedFile));
    })();
}