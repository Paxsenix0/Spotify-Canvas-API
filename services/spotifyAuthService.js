import axios from "axios";
import * as OTPAuth from "otpauth";
import dotenv from "dotenv";

dotenv.config();

const SP_DC = process.env.SP_DC;
const SECRETS_URL = "https://raw.githubusercontent.com/Thereallo1026/spotify-secrets/refs/heads/main/secrets/secretDict.json";

// Global variables to store the current TOTP configuration
let currentTotp = null;
let currentTotpVersion = null;
let lastFetchTime = 0;
const FETCH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// Initialize TOTP secrets on startup
initializeTOTPSecrets();

// Set up periodic updates
setInterval(updateTOTPSecrets, FETCH_INTERVAL);

async function initializeTOTPSecrets() {
  try {
    await updateTOTPSecrets();
  } catch (error) {
    console.error('Failed to initialize TOTP secrets:', error);
    // Fallback to the original hardcoded secret
    useFallbackSecret();
  }
}

async function updateTOTPSecrets() {
  try {
    const now = Date.now();
    if (now - lastFetchTime < FETCH_INTERVAL) {
      return; // Don't fetch too frequently
    }

    console.log('Fetching updated TOTP secrets...');
    const secrets = await fetchSecretsFromGitHub();
    const newestVersion = findNewestVersion(secrets);
    
    if (newestVersion && newestVersion !== currentTotpVersion) {
      const secretData = secrets[newestVersion];
      const totpSecret = createTotpSecret(secretData);
      
      currentTotp = new OTPAuth.TOTP({
        period: 30,
        digits: 6,
        algorithm: "SHA1",
        secret: totpSecret
      });
      
      currentTotpVersion = newestVersion;
      lastFetchTime = now;
      console.log(`TOTP secrets updated to version ${newestVersion}`);
    } else {
      console.log(`No new TOTP secrets found, using version ${newestVersion}`);
    }
  } catch (error) {
    console.error('Failed to update TOTP secrets:', error);
    // Keep using current TOTP if available, otherwise use fallback
    if (!currentTotp) {
      useFallbackSecret();
    }
  }
}

async function fetchSecretsFromGitHub() {
  try {
    const response = await axios.get(SECRETS_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch secrets from GitHub:', error.message);
    throw error;
  }
}

function findNewestVersion(secrets) {
  const versions = Object.keys(secrets).map(Number);
  return Math.max(...versions).toString();
}

function createTotpSecret(data) {
  const mappedData = data.map((value, index) => value ^ ((index % 33) + 9));
  const hexData = Buffer.from(mappedData.join(""), "utf8").toString("hex");
  return OTPAuth.Secret.fromHex(hexData);
}

function useFallbackSecret() {
  // Fallback to the original hardcoded secret
  // This secret will most likely fail because Spotify is rotating the secrets every couple of days
  // This is really just kept in here for reference
  const fallbackData = [99, 111, 47, 88, 49, 56, 118, 65, 52, 67, 50, 104, 117, 101, 55, 94, 95, 75, 94, 49, 69, 36, 85, 64, 74, 60];
  const totpSecret = createTotpSecret(fallbackData);
  
  currentTotp = new OTPAuth.TOTP({
    period: 30,
    digits: 6,
    algorithm: "SHA1",
    secret: totpSecret
  });
  
  currentTotpVersion = "19"; // Fallback version
  console.log('Using fallback TOTP secret');
}

export async function getToken(reason = "init", productType = "mobile-web-player") {
  // Ensure we have a TOTP instance
  if (!currentTotp) {
    await initializeTOTPSecrets();
  }

  const payload = await generateAuthPayload(reason, productType);

  const url = new URL("https://open.spotify.com/api/token");
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
    totpVer: currentTotpVersion || "19",
    totpServer: generateTOTP(Math.floor(serverTime / 30))
  };
}

async function getServerTime() {
  try {
    const { data } = await axios.get("https://open.spotify.com/api/server-time", {
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
  if (!currentTotp) {
    throw new Error("TOTP not initialized");
  }
  return currentTotp.generate({ timestamp });
}

function userAgent() {
  return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
}