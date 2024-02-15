import CryptoJS from "crypto-js";

function encryptMessage(message, key) {
    const ciphertext = CryptoJS.AES.encrypt(message, key).toString();
    console.log('ciphertext:', ciphertext)
    return ciphertext;
}

function decryptMessage(message, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(message, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        // Check if the decrypted message is valid UTF-8
        const decoder = new TextDecoder();
        decoder.decode(new Uint8Array(bytes.sigBytes)); 

        return decrypted;
    } catch (error) {
        console.log("Error decrypting message:");
        return ''; 
    }
};

export { encryptMessage, decryptMessage };