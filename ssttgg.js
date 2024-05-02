import os;
import cv2;
import wave;
import { PRGA, KSA, preparing_key_array, RC4_encrypt, RC4_decrypt } from 'rc4';
import { msgtobinary } from 'msgtobinary';

function KSA(key) {
    const key_length = key.length;
    let S = Array.from({length: 256}, (_, i) => i);
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % key_length]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
    }
    return S;
}

function PRGA(S, n) {
    let i = 0;
    let j = 0;
    let key = [];
    while (n > 0) {
        n = n - 1;
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
        const K = S[(S[i] + S[j]) % 256];
        key.push(K);
    }
    return key;
}

function preparing_key_array(s) {
    return Array.from(s, c => c.charCodeAt(0));
}

function RC4_encrypt(data, key) {
    key = preparing_key_array(key);
    return data; // Placeholder, replace with actual encryption logic
}

function RC4_decrypt(data, key) {
    key = preparing_key_array(key);
    return data; // Placeholder, replace with actual decryption logic
}

function msgtobinary(msg) {
    if (typeof msg === 'string') {
        return Array.from(msg, c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    } else if (typeof msg === 'number') {
        return msg.toString(2).padStart(8, '0');
    } else {
        throw new TypeError('Input type is not supported in this function');
    }
}

function encode_txt_data() {
    let count2 = 0;
    const file1 = open("C://Users//HP//Steganography-ToolKit-Using-Adaptive-Embedding-Techniques//covertext_sample.txt", "r");
    for (const line of file1) {
        for (const word of line.split()) {
            count2 = count2 + 1;
        }
    }
    file1.close();
    const bt = parseInt(count2);
    console.log("Maximum number of words that can be inserted:", parseInt(bt / 6));
    const text1 = input("Enter data to be encoded: ");
    const key = input("Enter the key for encryption: ");
    const encrypted_text = RC4_encrypt(text1.encode(), key);
    const l = encrypted_text.length;
    if (l <= bt) {
        console.log("\nInputted message can be hidden in the cover file\n");
        txt_encode(encrypted_text, key);
    } else {
        console.log("\nString is too big, please reduce string size");
        encode_txt_data();
    }
}

function txt_encode(text, key) {
    text = String.fromCharCode.apply(null, text); // Convert bytes to string
    const l = text.length;
    let i = 0;
    let add = '';
    while (i < l) {
        const t = text.charCodeAt(i);
        if (32 <= t <= 64) {
            const t1 = t + 48;
            const t2 = t1 ^ 170; // 170: 10101010
            const res = (t2).toString(2).padStart(8, '0');
            add += "0011" + res;
        } else {
            const t1 = t - 48;
            const t2 = t1 ^ 170;
            const res = (t2).toString(2).padStart(8, '0');
            add += "0110" + res;
        }
        i += 1;
    }
    const res1 = add + "111111111111";
    console.log("The string after binary conversion applying all the transformations:", res1);
    const length = res1.length;
    console.log("Length of binary after conversion:", length);
    const HM_SK = "";
    const ZWC = {"00": "\u200C", "01": "\u202C", "11": "\u202D", "10": "\u200E"};
    const file1 = open("C://Users//HP//Steganography-ToolKit-Using-Adaptive-Embedding-Techniques//covertext_sample.txt", "r+");
    const nameoffile = input("Enter the name of the Stego file after Encoding (with extension): ");
    const file3 = open(nameoffile, "w+", encoding="utf-8");
    const word = [];
    for (const line of file1) {
        word.push(...line.split());
    }
    i = 0;
    while (i < res1.length) {
        const s = word[Math.floor(i / 12)];
        let j = 0;
        let x = "";
        let HM_SK = "";
        while (j < 12) {
            x = res1[j + i] + res1[i + j + 1];
            HM_SK += ZWC[x];
            j += 2;
        }
        const s1 = s + HM_SK;
        file3.write(s1);
        file3.write(" ");
        i += 12;
    }
    let t = Math.floor(res1.length / 12);
    while (t < word.length) {
        file3.write(word[t]);
        file3.write(" ");
        t += 1;
    }
    file3.close();
    file1.close();
    console.log("\nStego file has been successfully generated.");
}

function decode_txt_data(key) {
    const ZWC_reverse = {"\u200C": "00", "\u202C": "01", "\u202D": "11", "\u200E": "10"};
    const stego = input("\nPlease enter the stego file name (with extension) to decode the message: ");
    const file4 = open(stego, "r", encoding="utf-8");
    let temp = '';
    for (const line of file4) {
        for (const words of line.split()) {
            const T1 = words;
            let binary_extract = "";
            for (const letter of T1) {
                if (letter in ZWC_reverse) {
                    binary_extract += ZWC_reverse[letter];
                }
            }
            if (binary_extract === "111111111111") {
                break;
            } else {
                temp += binary_extract;
            }
        }
    }
    console.log("\nEncrypted message presented in code bits:", temp);
    const lengthd = temp.length;
    console.log("\nLength of encoded bits:", lengthd);
    let i = 0;
    let a = 0;
    let b = 4;
    let c = 4;
    let d = 12;
    let final = '';
    while (i < temp.length) {
        const t3 = temp.slice(a, b);
        a += 12;
        b += 12;
        i += 12;
        const t4 = temp.slice(c, d);
        c += 12;
        d += 12;
        if (t3 === '0110') {
            const decrypted_data = RC4_decrypt(parseInt(t4, 2).toString(10), key); // Decrypt binary to bytes
            final += decrypted_data;  // Decode with 'ignore' error handling
        } else if (t3 === '0011') {
            const decrypted_data = RC4_decrypt(parseInt(t4, 2).toString(10), key); // Decrypt binary to bytes
            final += decrypted_data;  // Decode with 'ignore' error handling
        }
    }
    console.log("\nMessage after decoding from the stego file:", final);
}

function txt_steg() {
    while (true) {
        console.log("\n\t\tTEXT STEGANOGRAPHY OPERATIONS");
        console.log("1. Encode the Text message");
        console.log("2. Decode the Text message");
        console.log("3. Exit");
        const choice1 = parseInt(input("Enter the Choice: "));
        if (choice1 === 1) {
            encode_txt_data();
        } else if (choice1 === 2) {
            const key = input("Enter the key for decryption: ");
            decode_txt_data(key);
        } else if (choice1 === 3) {
            break;
        } else {
            console.log("Incorrect Choice");
        }
        console.log("\n");
    }
}

function KSA(key) {
    const key_length = key.length;
    let S = Array.from({length: 256}, (_, i) => i);
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % key_length]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
    }
    return S;
}

function PRGA(S, n) {
    let i = 0;
    let j = 0;
    let key = [];
    while (n > 0) {
        n = n - 1;
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
        const K = S[(S[i] + S[j]) % 256];
        key.push(K);
    }
    return key;
}

function msgtobinary(msg) {
    if (typeof msg === 'string') {
        return Array.from(msg, c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    } else if (typeof msg === 'number') {
        return msg.toString(2).padStart(8, '0');
    } else {
        throw new TypeError('Input type is not supported in this function');
    }
}

function preparing_key_array(s) {
    if (typeof s === 'number') {
        return Array(256).fill(s);
    } else if (typeof s === 'string') {
        return Array.from(s, c => c.charCodeAt(0));
    } else {
        throw new TypeError('Key type not supported');
    }
}

function RC4_encrypt(data, key) {
    key = preparing_key_array(key);
    return data; // Placeholder, replace with actual encryption logic
}

function RC4_decrypt(data, key) {
    key = preparing_key_array(key);
    return data; // Placeholder, replace with actual decryption logic
}

function encode_img_data(img) {
    const data = input("\nEnter the data to be Encoded in Image :");
    if (data.length === 0) {
        throw new ValueError('Data entered to be encoded is empty');
    }

    const nameoffile = input("\nEnter the name of the New Image (Stego Image) after Encoding(with extension):");

    const no_of_bytes = (img.shape[0] * img.shape[1] * 3) / 8;

    console.log("\t\nMaximum bytes to encode in Image :", no_of_bytes);

    if (data.length > no_of_bytes) {
        throw new ValueError("Insufficient bytes Error, Need Bigger Image or give Less Data !!");
    }

    data +='*^*^*';

    const binary_data = msgtobinary(data);
    console.log("\n");
    console.log(binary_data);
    const length_data = binary_data.length;

    console.log("\nThe Length of Binary data",length_data);

    let index_data = 0;

    for (const i of img) {
        for (const pixel of i) {
            let [r, g, b] = msgtobinary(pixel);
            if (index_data < length_data) {
                r = parseInt(r.slice(0, -1) + binary_data[index_data], 2);
                index_data += 1;
            }
            if (index_data < length_data) {
                g = parseInt(g.slice(0, -1) + binary_data[index_data], 2);
                index_data += 1;
            }
            if (index_data < length_data) {
                b = parseInt(b.slice(0, -1) + binary_data[index_data], 2);
                index_data += 1;
            }
            if (index_data >= length_data) {
                break;
            }
        }
    }
    cv2.imwrite(nameoffile,img);
    console.log("\nEncoded the data successfully in the Image and the image is successfully saved with name ",nameoffile);
}

function decode_img_data(img) {
    let data_binary = "";
    for (const i of img) {
        for (const pixel of i) {
            const [r, g, b] = msgtobinary(pixel);
            data_binary += r.slice(-1);
            data_binary += g.slice(-1);
            data_binary += b.slice(-1);
            const total_bytes = Array.from({length: data_binary.length / 8}, (_, i) => data_binary.slice(i * 8, (i + 1) * 8));
            let decoded_data = "";
            for (const byte of total_bytes) {
                decoded_data += String.fromCharCode(parseInt(byte, 2));
                if (decoded_data.slice(-5) === "*^*^*") {
                    console.log("\n\nThe Encoded data which was hidden in the Image was :--  ",decoded_data.slice(0, -5));
                    return;
                }
            }
        }
    }
}

function img_steg() {
    while (true) {
        console.log("\n\t\tIMAGE STEGANOGRAPHY OPERATIONS");
        console.log("1. Encode the Text message");
        console.log("2. Decode the Text message");
        console.log("3. Exit");
        const choice1 = parseInt(input("Enter the Choice: "));
        if (choice1 === 1) {
            const key = input("Enter the key for encryption: ");  // Prompt the user to enter the key as a string
            const image = cv2.imread("C://Users//HP//Steganography-ToolKit-Using-Adaptive-Embedding-Techniques//coverimage_sample.png");
            const encrypted_image = RC4_encrypt(image, key);  // Pass the key as a string
            encode_img_data(encrypted_image);
        } else if (choice1 === 2) {
            const image1 = cv2.imread(input("Enter the Image you need to Decode to get the Secret message :  "));
            const key = input("Enter the key for decryption: ");  // Prompt the user to enter the key as a string
            const decrypted_image = RC4_decrypt(image1, key);  // Pass the key as a string
            decode_img_data(decrypted_image);
        } else if (choice1 === 3) {
            break;
        } else {
            console.log("Incorrect Choice");
        }
        console.log("\n");
    }
}

function encode_aud_data() {
    const wave = require('wave');
    const nameoffile = input("Enter name of the file (with extension) :- ");
    const song = wave.open(nameoffile, mode='rb');

    const nframes = song.getnframes();
    const frames = song.readframes(nframes);
    const frame_list = Array.from(frames);
    const frame_bytes = new Uint8Array(frame_list);

    const data = input("\nEnter the secret message :- ");

    const res = Array.from(data, c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    console.log("\nThe string after binary conversion :- " + (res));
    const length = res.length;
    console.log("\nLength of binary after conversion :- ",length);

    data += '*^*^*';

    const result = [];
    for (const c of data) {
        const bits = c.charCodeAt(0).toString(2).padStart(8, '0');
        result.push(...Array.from(bits, Number));
    }

    let j = 0;
    for (let i = 0; i < result.length; i++) {
        const res = frame_bytes[j].toString(2).padStart(8, '0');
        if (res.slice(-4) === result[i]) {
            frame_bytes[j] = frame_bytes[j] & 253;      //253: 11111101
        } else {
            frame_bytes[j] = (frame_bytes[j] & 253) | 2;
            frame_bytes[j] = (frame_bytes[j] & 254) | result[i];
        }
        j = j + 1;
    }

    const frame_modified = new Uint8Array(frame_bytes);

    const stegofile = input("\nEnter name of the stego file (with extension) :- ");
    const fd = wave.open(stegofile, 'wb');
    fd.setparams(song.getparams());
    fd.writeframes(frame_modified);
    console.log("\nEncoded the data successfully in the audio file.");
    song.close();
}

function decode_aud_data() {
    const wave = require('wave');

    const nameoffile = input("Enter name of the file to be decoded :- ");
    const song = wave.open(nameoffile, mode='rb');

    const nframes = song.getnframes();
    const frames = song.readframes(nframes);
    const frame_list = Array.from(frames);
    const frame_bytes = new Uint8Array(frame_list);

    let extracted = "";
    let p = 0;
    for (let i = 0; i < frame_bytes.length; i++) {
        if (p === 1) {
            break;
        }
        const res = frame_bytes[i].toString(2).padStart(8, '0');
        if (res.slice(-2) === '00') {
            extracted += res.slice(-4);
        } else {
            extracted += res.slice(-1);
        }
        const all_bytes = Array.from({length: extracted.length / 8}, (_, i) => extracted.slice(i * 8, (i + 1) * 8));
        let decoded_data = "";
        for (const byte of all_bytes) {
            decoded_data += String.fromCharCode(parseInt(byte, 2));
            if (decoded_data.slice(-5) === "*^*^*") {
                console.log("The Encoded data was :--",decoded_data.slice(0, -5));
                p = 1;
                break;
            }
        }
    }
}

function aud_steg() {
    while (true) {
        console.log("\n\t\tAUDIO STEGANOGRAPHY OPERATIONS");
        console.log("1. Encode the Text message");
        console.log("2. Decode the Text message");
        console.log("3. Exit");
        const choice1 = parseInt(input("Enter the Choice:"));
        if (choice1 === 1) {
            encode_aud_data();
        } else if (choice1 === 2) {
            decode_aud_data();
        } else if (choice1 === 3) {
            break;
        } else {
            console.log("Incorrect Choice");
        }
        console.log("\n");
    }
}

function KSA(key) {
    const key_length = key.length;
    let S = Array.from({length: 256}, (_, i) => i);
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % key_length]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
    }
    return S;
}

function PRGA(S, n) {
    let i = 0;
    let j = 0;
    let key = [];
    while (n > 0) {
        n = n - 1;
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
        const K = S[(S[i] + S[j]) % 256];
        key.push(K);
    }
    return key;
}

function msgtobinary(msg) {
    if (typeof msg === 'string') {
        return Array.from(msg, c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    } else if (typeof msg === 'number') {
        return msg.toString(2).padStart(8, '0');
    } else {
        throw new TypeError('Input type is not supported in this function');
    }
}

function preparing_key_array(s) {
    if (typeof s === 'number') {
        return Array(256).fill(s);
    } else if (typeof s === 'string') {
        return Array.from(s, c => c.charCodeAt(0));
    } else {
        throw new TypeError('Key type not supported');
    }
}

function RC4_encrypt(data, key) {
    key = preparing_key_array(key);
    return data; // Placeholder, replace with actual encryption logic
}

function RC4_decrypt(data, key) {
    key = preparing_key_array(key);
    return data; // Placeholder, replace with actual decryption logic
}

function encryption(plaintext) {
    console.log("Enter the key : ");
    const key = input();
    const key = preparing_key_array(key);

    const S = KSA(key);

    const keystream = PRGA(S, plaintext.length);
    const plaintext = Array.from(plaintext, c => c.charCodeAt(0));

    const cipher = keystream.map((k, i) => k ^ plaintext[i]);
    let ctext = '';
    for (const c of cipher) {
        ctext += String.fromCharCode(c);
    }
    return ctext;
}

function decryption(ciphertext) {
    console.log("Enter the key : ");
    const key = input();
    const key = preparing_key_array(key);

    const S = KSA(key);

    const keystream = PRGA(S, ciphertext.length);
    const ciphertext = Array.from(ciphertext, c => c.charCodeAt(0));

    const decoded = keystream.map((k, i) => k ^ ciphertext[i]);
    let dtext = '';
    for (const c of decoded) {
        dtext += String.fromCharCode(c);
    }
    return dtext;
}

function embed(frame) {
    const data = input("\nEnter the data to be Encoded in Video :");
    const data = encryption(data);
    console.log("The encrypted data is : ",data);
    if (data.length === 0) {
        throw new ValueError('Data entered to be encoded is empty');
    }

    data +='*^*^*';

    const binary_data = msgtobinary(data);
    const length_data = binary_data.length;

    let index_data = 0;

    for (const i of frame) {
        for (const pixel of i) {
            let [r, g, b] = msgtobinary(pixel);
            if (index_data < length_data) {
                r = parseInt(r.slice(0, -1) + binary_data[index_data], 2);
                index_data += 1;
            }
            if (index_data < length_data) {
                g = parseInt(g.slice(0, -1) + binary_data[index_data], 2);
                index_data += 1;
            }
            if (index_data < length_data) {
                b = parseInt(b.slice(0, -1) + binary_data[index_data], 2);
                index_data += 1;
            }
            if (index_data >= length_data) {
                break;
            }
        }
    }
    return frame;
}

function extract(frame) {
    let data_binary = "";
    let final_decoded_msg = "";
    for (const i of frame) {
        for (const pixel of i) {
            const [r, g, b] = msgtobinary(pixel);
            data_binary += r.slice(-1);
            data_binary += g.slice(-1);
            data_binary += b.slice(-1);
            const total_bytes = Array.from({length: data_binary.length / 8}, (_, i) => data_binary.slice(i * 8, (i + 1) * 8));
            let decoded_data = "";
            for (const byte of total_bytes) {
                decoded_data += String.fromCharCode(parseInt(byte, 2));
                if (decoded_data.slice(-5) === "*^*^*") {
                    for (let i = 0; i < decoded_data.length - 5; i++) {
                        final_decoded_msg += decoded_data[i];
                    }
                    final_decoded_msg = decryption(final_decoded_msg);
                    console.log("\n\nThe Encoded data which was hidden in the Video was :--\n",final_decoded_msg);
                    return;
                }
            }
        }
    }
}

function encode_vid_data() {
    const cap = cv2.VideoCapture("covervideo_sample.mp4");
    const vidcap = cv2.VideoCapture("covervideo_sample.mp4");
    const fourcc = cv2.VideoWriter_fourcc(*'XVID');
    const frame_width = parseInt(vidcap.get(3));
    const frame_height = parseInt(vidcap.get(4));

    const size = [frame_width, frame_height];
    const out = cv2.VideoWriter('stegovideo.mp4', fourcc, 25.0, size);
    let max_frame = 0;
    while (cap.isOpened()) {
        const ret, frame = cap.read();
        if (ret === false) {
            break;
        }
        max_frame += 1;
    }
    cap.release();
    console.log("Total number of Frame in selected Video :",max_frame);
    console.log("Enter the frame number where you want to embed data : ");
    const n = parseInt(input());
    let frame_number = 0;
    while (vidcap.isOpened()) {
        frame_number += 1;
        const ret, frame = vidcap.read();
        if (ret === false) {
            break;
        }
        if (frame_number === n) {
            const change_frame_with = embed(frame);
            const frame_ = change_frame_with;
            frame = change_frame_with;
        }
        out.write(frame);
    }
    console.log("\nEncoded the data successfully in the video file.");
    return frame_;
}

function decode_vid_data(frame_) {
    const cap = cv2.VideoCapture('stegovideo.mp4');
    let max_frame = 0;
    while (cap.isOpened()) {
        const ret, frame = cap.read();
        if (ret === false) {
            break;
        }
        max_frame += 1;
    }
    console.log("Total number of Frame in selected Video :",max_frame);
    console.log("Enter the secret frame number from where you want to extract data");
    const n = parseInt(input());
    const vidcap = cv2.VideoCapture('stegovideo.mp4');
    let frame_number = 0;
    while (vidcap.isOpened()) {
        frame_number += 1;
        const ret, frame = vidcap.read();
        if (ret === false) {
            break;
        }
        if (frame_number === n) {
            extract(frame_);
            return;
        }
    }
}

function vid_steg() {
    while (true) {
        console.log("\n\t\tVIDEO STEGANOGRAPHY OPERATIONS");
        console.log("1. Encode the Text message");
        console.log("2. Decode the Text message");
        console.log("3. Exit");
        const choice1 = parseInt(input("Enter the Choice:"));
        if (choice1 === 1) {
            const a = encode_vid_data();
        } else if (choice1 === 2) {
            decode_vid_data(a);
        } else if (choice1 === 3) {
            break;
        } else {
            console.log("Incorrect Choice");
        }
        console.log("\n");
    }
}

function main() {
    
    while (true) {
        console.log("\n\t\tSTEGANOGRAPHY OPERATIONS");
        console.log("1. Text Steganography");
        console.log("2. Image Steganography");
        console.log("3. Audio Steganography");
        console.log("4. Video Steganography");
        console.log("5. Exit");
        const choice = parseInt(input("Enter the Choice:"));
        if (choice === 1) {
            txt_steg();
        } else if (choice === 2) {
            img_steg();
        } else if (choice === 3) {
            aud_steg();
        } else if (choice === 4) {
            vid_steg();
        } else if (choice === 5) {
            break;
        } else {
            console.log("Incorrect Choice");
        }
        console.log("\n");
    }
}

main();


