let remoteURI = (process.env.MONGO_URI) as string;
let secret = (process.env.APP_SECRET) as string;
export default {
    remoteURI: remoteURI,
    secret: secret
}