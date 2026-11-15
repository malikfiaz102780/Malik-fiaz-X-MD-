const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const P = require("pino");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function pairBot() {
  const number = (await ask(
    "Enter WhatsApp number with country code (e.g. 923001234567): "
  )).replace(/\D/g, "");

  if (!number.startsWith("92") || number.length !== 12) {
    console.log("Pakistan number format ghalat hai.");
    rl.close();
    return;
  }

  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  const code = await sock.requestPairingCode(number);

  console.log("\nYour Pairing Code:", code);
  console.log("WhatsApp > Linked Devices > Link a Device");
  console.log("Use phone number instead, then enter the code.");

  rl.close();
}

pairBot().catch((error) => {
  console.error(error);
  rl.close();
});
