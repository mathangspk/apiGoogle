const { google } = require('googleapis')
const path = require('path');
const fs = require('fs');
const mime = require('mime-types')
const moment = require('moment')
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
//const pathName = 'D://file';
const pathName = '/home/mathang/backups/mongoManageTool/lastest';
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
async function uploadMultiFileInFolder(folderId) {
    console.log('Starting upload file to Folder: ', folderId)
    for (var i in files) {
        fileInfo[i] = {
            name: files[i],
            pathName: pathName + '/' + files[i],
            mimeType: mime.lookup(files[i]),
        }
        await createFileInFolder(folderId, fileInfo[i].name, fileInfo[i].mimeType, fileInfo[i].pathName)
    }
}
//uploadMultiFile();
var obj = { folder: [] }
function check(folder, nameFolder) {
    for (var i = 0; i < folder.length; i++) {
        console.log(folder[i].name)
        if (folder[i].name === nameFolder) {
            return folder[i].id;
        }
    } return false;
}
function findIdDelete(obj) {
    for (var i = 0; i < obj.folder.length; i++) {
        var today = new Date()
        var priorDate = new Date().setDate(today.getDate() - 7)
        //console.log(moment(priorDate).format('YYYY-MM-DD'))
        priorDate = moment(priorDate).format('YYYY-MM-DD');
        if (obj.folder[i].name === priorDate) {
            let idDelete = obj.folder[i].id;
            obj.folder.splice(0,1);
            var json = JSON.stringify(obj)
            fs.writeFile('data.json', json, 'utf8', () => {
                console.log('file write')
            })
            return idDelete;
        }
    } return false;
}
async function checkExitsFolder(nameFolder) {
    let parentFolder = '1fDaYNjc9_p20Iot7yThUsLmNBS2iOpCp';
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err)
        } else if (data) {
            console.log('Exist data in Json File')
            obj = JSON.parse(data);
            let folder = obj.folder;
            let idNameDelete = findIdDelete(obj)
            if (!idNameDelete) {
                console.log("Don't need remove any folder")
            } else {
                console.log("FolderId was deleted: ",idNameDelete)
                deleteFolder(idNameDelete);
            }
            let existName = (check(folder, nameFolder))
            if (!existName) {
                console.log('Not exist folder Today in JSON data')
                createFolderInFolder(parentFolder, nameFolder, true);
            } else {
                console.log('Exist folder Today in JSON data')
                console.log(existName)
                uploadMultiFileInFolder(existName);
            }

        } else {
            console.log("Don't have any data in data.json file")
            //tao folder moi && upload file
            createFolderInFolder(parentFolder, nameFolder, true);

        }
    })
}
checkExitsFolder(String(moment().format('YYYY-MM-DD')))


async function addData(id, name, time) {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err)
        } else if (data) {
            console.log('co du lieu')
            obj = JSON.parse(data);
            let folder = obj.folder;
            folder.map((element, index) => {
                if (element.name === name) {
                    console.log('co ton tai')
                } else {
                    console.log('ko ton tai')
                }
                //console.log(index,element)
            })
            obj.folder.push({ id, name, time })
            var json = JSON.stringify(obj)
            fs.writeFile('data.json', json, 'utf8', () => {
                console.log('file write')
            })
        } else {
            console.log('ko co du lieu');
            obj.folder.push({ id, name, time })
            var json = JSON.stringify(obj)
            fs.writeFile('data.json', json, 'utf8', () => {
                console.log('file write')
            })
        }
    })
}


const filePath = path.join(__dirname, 'checklist.doc')

async function uploadFile(name, path, mimeType) {
    try {
        var folderId = '1fDaYNjc9_p20Iot7yThUsLmNBS2iOpCp';
        const response = await drive.files.create({
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
        console.log(response.data);
    } catch (error) {
        console.log(error.message);
    }
}


async function deleteFile() {
    try {
        const response = await drive.files.delete({
            fileId: '1rTxcy0VHpUQGclZpf4xZPtSCTf7CfKUw',
        });
        console.log(response.data, response.status)

    } catch (error) {
        console.log(error.message)
    }
}
async function deleteFolder(fileId) {
    try {
        const response = await drive.files.delete({
            fileId,
        });
        console.log(response.data, response.status)

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
                return file.data.id
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

async function createFileInFolder(id, name, mimeType, path) {
    try {
        var folderId = id;
        var fileMetadata = {
            'name': name,
            parents: [folderId]
        };
        var media = {
            mimeType,
            body: fs.createReadStream(path)
        };
        await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name'
        }, function (err, file) {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log('Upload file: ', file.data, 'complete')
            }
        });
    } catch (error) {
        console.log(error)
    }
}
async function createFolderInFolder(folderId, name, UploadFile) {
    try {
        var fileMetadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder',
            parents: [folderId]
        };
        await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log('Create Folder successfully');
                console.log('Folder Id: ', file.data.id);
                obj.folder.push({ id: file.data.id, name: name, time: moment() })
                var json = JSON.stringify(obj)
                fs.writeFile('data.json', json, 'utf8', () => {
                    console.log('Save data to data.json complete!')
                })
                if (UploadFile) {
                    uploadMultiFileInFolder(file.data.id)
                }

            }
        });
    } catch (error) {
        console.log(error)
    }
}

async function getListFile() {
    await drive.files.list({
        //q: "mimeType = 'application/vnd.google-apps.folder'",
        q: "folderId= '1fDaYNjc9_p20Iot7yThUsLmNBS2iOpCp'",
        //folderId: '1fDaYNjc9_p20Iot7yThUsLmNBS2iOpCp'
        //parents: '1fDaYNjc9_p20Iot7yThUsLmNBS2iOpCp'
    }, (err, file) => {
        console.log(file.data.files)
    })
}
function generateNameFolder() {
    let date = moment();
    console.log(date)
}
//generateNameFolder();
//addData('asd', 'asad', moment().format('YYYY-MM-DD'))
//getListFile();
//generatePublicUrl();
//uploadFile();
//createFolder('backupMongoMangeTool');

//deleteFolder('1d1I00M3_H1AvV8Y-_BSEc0sVfD12_K_n');
//createFolderInFolder(String(moment().format('YYYY-MM-DD')));
//createFileInFolder();

//id backupMongoMangeTool 1fDaYNjc9_p20Iot7yThUsLmNBS2iOpCp