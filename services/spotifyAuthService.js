import axios from "axios";
import * as OTPAuth from "otpauth";

const SP_DC = process.env.SP_DC;

const totp = new OTPAuth.TOTP({
  period: 30,
  digits: 6,
  algorithm: "SHA1",
  secret: OTPAuth.Secret.fromHex("35353037313435383533343837343939353932323438363330333239333437"),
});

export async function getToken(reason = "init", productType = "web-player") {
  const payload = await generateAuthPayload(reason, productType);

  const url = new URL("https://open.spotify.com/get_access_token");
  Object.entries(payload).forEach(([key, value]) => url.searchParams.append(key, value));

  const response = await axios.get(url.toString(), {
    headers: {
      'User-Agent': userAgent(),
      'Origin': 'https://open.spotify.com/',
      'Referer': 'https://open.spotify.com/',
      'Cookie': `sp_dc=${SP_DC}`,
    },
  });

  return response.data?.accessToken;
}

async function generateAuthPayload(reason, productType) {
  const localTime = Date.now();
  const serverTime = await getServerTime();

  return {
    reason,
    productType,
    totp: generateTOTP(localTime),
    totpVer: "5",
    totpServer: generateTOTP(Math.floor(serverTime / 30)),
    sTime: String(serverTime),
    cTime: String(localTime),
    buildVer: "web-player_2025-03-20_1742497479926_93656b9",
    buildDate: "2025-03-20"
  };
}

async function getServerTime() {
  try {
    const { data } = await axios.get("https://open.spotify.com/server-time", {
      headers: {
        'User-Agent': userAgent(),
        'Origin': 'https://open.spotify.com/',
        'Referer': 'https://open.spotify.com/',
        'Cookie': `sp_dc=${SP_DC}`,
      },
    });

    const time = Number(data.serverTime);
    if (isNaN(time)) throw new Error("Invalid server time");
    return time * 1000;
  } catch {
    return Date.now();
  }
}

function generateTOTP(timestamp) {
  return totp.generate({ timestamp });
}

function userAgent() {
  return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
}