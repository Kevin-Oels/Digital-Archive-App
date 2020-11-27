import S3 from "aws-sdk/clients/s3";
import { Credentials } from "aws-sdk";

const access = new Credentials({
    accessKeyId: process.env.REACT_APP_AWS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET,
});
  
const s3 = new S3({
    credentials: access,
    region: process.env.REACT_APP_S3_REGION, //"eu-west-1"
    signatureVersion: "v4",
});

const signedUrlExpireSeconds = 60 * 15;

const requestUpload = async (fileId) => {
    const url = await s3.getSignedUrlPromise("putObject", {
        Bucket: process.env.REACT_APP_S3_BUCKET,
        Key: `${fileId}.pdf`,
        ContentType: "application/pdf",
        Expires: signedUrlExpireSeconds,
      });
      
    return url;
}

export const downloadFile = async (fileid) => {
    const url = s3.getSignedUrl('getObject', {
        Bucket: process.env.REACT_APP_S3_BUCKET,
        Key: fileid,
        Expires: signedUrlExpireSeconds,
    })
    return url
}

export const uploadFile = async (file, fileid) => {
    const uploadUrl = await requestUpload(fileid);
    return fetch(uploadUrl, {
        method: "PUT",
        body: file,
    });
}

export default uploadFile

