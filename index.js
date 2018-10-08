const fs = require('fs');
const path = require('path');
const { argv } = require('optimist');
const mkdirp = require('mkdirp');
const fetch = require('node-fetch');
const remarkable = require('remarkable-tablet-api');

function getDocPath(docs, doc) {
  const getDocByID = id => docs.find(d => d.ID === id);

  let docPath = '';
  let current = doc;

  do {
    docPath = `${current.ID}${docPath === '' ? '' : '/'}${docPath}`;
    current = getDocByID(current.Parent);
  } while (current !== undefined);

  return `${docPath}.zip`;
}

function die(msg) {
  console.error(msg);
  process.exit(1);
}

async function main() {
  if (argv.output === undefined || argv.code === undefined) {
    die(`Usage: --output=backup-directory --code=one-time-code
      Get a one-time-code from https://my.remarkable.com/generator-device`);
    return;
  }

  if (fs.existsSync(argv.output)) {
    die(`${argv.output} already exists`);
    return;
  }

  const { token } = await remarkable.authenticateDevice(argv.code);
  const userToken = await remarkable.authenticateUser(token);

  const storageHost = await remarkable.getStorageHost();

  const docList = await remarkable.docs(storageHost, userToken);
  const files = docList.filter(doc => doc.Type === 'DocumentType');

  files.forEach((docInfo) => {
    const docPath = path.join(argv.output, getDocPath(docList, docInfo));
    const dir = path.dirname(docPath);

    mkdirp(dir, async (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
        return;
      }

      const [docDlInfo] = await remarkable.docs(storageHost, userToken, {
        id: docInfo.ID,
        withBlob: true,
      });

      if (docDlInfo.BlobURLGet === undefined) {
        throw new Error('No download URL');
      }

      const doc = await fetch(docDlInfo.BlobURLGet);
      fs.writeFile(docPath, await doc.buffer(), (writeErr) => {
        if (writeErr) {
          console.error('Failed to write file:', writeErr);
          process.exit(1);
          return;
        }

        console.log(docPath);
      });
    });
  });
}

main();
