import CryptoJS from "crypto-js";

function encryptMessage(message, key) {
    const ciphertext = CryptoJS.AES.encrypt(message, key).toString();
    console.log('ciphertext:', ciphertext)
    return ciphertext;
}

function decryptMessage(message, key) {
    const bytes = CryptoJS.AES.decrypt(message, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
};

export { encryptMessage, decryptMessage };