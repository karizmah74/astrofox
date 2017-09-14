import { Buffer as NodeBuffer } from 'buffer';

export function toArrayBuffer(buffer) {
    let ab = new ArrayBuffer(buffer.length);
    let b = new Uint8Array(ab);

    for (let i = 0; i < buffer.length; ++i) {
        b[i] = buffer[i];
    }

    return ab;
}

export function toBuffer(ab) {
    let buffer = new NodeBuffer(ab.byteLength);
    let view = new Uint8Array(ab);

    for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }

    return buffer;
}