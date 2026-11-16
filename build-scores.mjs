// 사용법: node build-scores.mjs scores.local.json "비밀번호"
// scores.local.json 예: {"윤성필":80,"김권태":75}  (이 파일은 올리지 않음 — .gitignore)
// 결과: scores.enc.js (암호화됨, 올려도 됨)
import {webcrypto as crypto} from 'node:crypto';
import fs from 'node:fs';

const [,, file, pass] = process.argv;
if(!file||!pass){console.error('node build-scores.mjs scores.local.json "비밀번호"');process.exit(1)}
const scores = JSON.parse(fs.readFileSync(file,'utf8'));
const b64 = u8 => Buffer.from(u8).toString('base64');
const it = 600000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'}, km, {name:'AES-GCM',length:256}, false, ['encrypt']);
const data = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, new TextEncoder().encode(JSON.stringify(scores))));
fs.writeFileSync(new URL('./scores.enc.js', import.meta.url), `window.SCORES_ENC=${JSON.stringify({s:b64(salt),i:b64(iv),d:b64(data),it})};\n`);
console.log(`scores.enc.js 생성 완료 (${Object.keys(scores).length}명)`);
