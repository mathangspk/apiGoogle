const { google } = require('googleapis')
const path = require('path');
const fs = require('fs');
const mime = require('mime-types')

const CLIENT_ID = "1053431940611-he0t7ad89i0edv52qdhj549rfqao92tn.apps.googleusercontent.com"
const CLIENT_SECRET = "ffsLMIA1lnx80nFu_9TRpGX1"
const REDIRECT_URI = "https://developers.google.com/oauthplayground"

const REFRESH_TOKEN = "1//04eHozIxocK1PCgYIARAAGAQSNwF-L9IrfKyG7eLV6oIaagzUxJNAVepcdXvngpZuy9Hn5mcax8gNjas03YqK0FowiQupOsWXS14"

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})
fileInfo = [];
const pathName = 'D://file';
const files = fs.readdirSync(pathName);
async function uploadMultiFile() {
    for (var i in files) {
        fileInfo[i] = {
            name: files[i],
            pathName: pathName + '/' + files[i],
            mimeType: mime.lookup(files[i]),
        }
        await uploadFile(fileInfo[i].name, fileInfo[i].pathName, fileInfo[i].mimeType)
    }
}
uploadMultiFile();


const filePath = path.join(__dirname, 'checklist.doc')
console.log(filePath)

async function uploadFile(name, path, mimeType) {
    try {
        var folderId = '1fDaYNjc9_p20Iot7yThUsLmNBS2iOpCp';
        const respone = await drive.files.create({
            requestBody: {
                name,
                mimeType,
                parents: [folderId]
                //mimeType: 'text/plain'
            },
            media: {
                //mimeType: 'text/plain',
                mimeType,
                body: fs.createReadStream(path)
            }
        })
        console.log(respone.data);
    } catch (error) {
        console.log(error.message);
    }
}


async function deleteFile() {
    try {
        const respone = await drive.files.delete({
            fileId: '1rTxcy0VHpUQGclZpf4xZPtSCTf7CfKUw',
        });
        console.log(respone.data, respone.status)

    } catch (error) {
        console.log(error.message)
    }
}
async function deleteFolder(fileId) {
    try {
        const respone = await drive.files.delete({
            fileId,
        });
        console.log(respone.data, respone.status)

    } catch (error) {
        console.log(error.message)
    }
}

//deleteFile();
async function generatePublicUrl() {
    try {
        const fileId = '1gZawr06BabXxV5_Gb8VcnNBPm54XkR9o'
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })
        const result = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
        })
        console.log(result.data)
    } catch (error) {
        console.log(error.message)
    }
}

async function createFolder(name) {
    try {
        let fileMetadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder'
        };
        await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        }, (error, file) => {
            if (error) {
                console.log(error)
            } else {
                console.log('Folder Id: ', file.data.id)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

async function createFileInFolder() {
    try {
        var folderId = '1vXUZunTRB_utE8Dcmwtt0NDkheS5UmYf';
        var fileMetadata = {
            'name': 'photo.jpg',
            parents: [folderId]
        };
        var media = {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(filePath)
        };
        drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log('File Id: ', file.id);
            }
        });
    } catch (error) {
        console.log(error)
    }
}
async function createFolderInFolder() {
    try {
        var folderId = '1vXUZunTRB_utE8Dcmwtt0NDkheS5UmYf';
        var fileMetadata = {
            'name': 'New Folder 1',
            'mimeType': 'application/vnd.google-apps.folder',
            parents: [folderId]
        };
        var media = {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(filePath)
        };
        drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log('File Id: ', file.data.id);
            }
        });
    } catch (error) {
        console.log(error)
    }
}
//generatePublicUrl();
//uploadFile();
//createFolder('backupMongoMangeTool');

//deleteFolder('1d1I00M3_H1AvV8Y-_BSEc0sVfD12_K_n');
//createFolderInFolder();
//createFileInFolder();

//id backupMongoMangeTool 1fDaYNjc9_p20Iot7yThUsLmNBS2iOpCp