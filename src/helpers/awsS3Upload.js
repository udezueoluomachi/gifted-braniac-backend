const { S3 } = require('aws-sdk')
const uuid = require('uuid')


exports.uploadFile = async function (files) {
    const s3 = new S3()

    files = Object.values(files)

    const uploads = files.map(file => {
        file = Array.isArray(file) ? file[0] : file
        const fileName = file.originalname.split(' ').join('_')
        return ({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${file.fieldname}-${uuid.v1()}-${fileName}`,
            Body: file.buffer
        })
    })

    return await Promise.all(uploads.map(param => s3.upload(param).promise()))
}


module.exports.downloadFile = function (key) {
    const s3 = new S3();

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    }
    return { s3, params }
}
