const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const config = require("./config");

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["MALIK FIAZ MD", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("MALIK FIAZ MD CONNECTED ✅");
    }

    if (connection === "close") {
      const code =
        lastDisconnect?.error?.output?.statusCode;

      if (code !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log("Session logged out. Pair again.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg || !msg.message || msg.key.fromMe) return;

    const chat = msg.key.remoteJid;
    if (!chat || chat === "status@broadcast") return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text) return;

    if (config.autoReply) {
      await sock.sendMessage(chat, {
        text: config.autoReplyMessage
      });
    }

    if (text.trim() === config.prefix + "ping") {
      await sock.sendMessage(chat, {
        text: "Pong! MALIK FIAZ MD is online ✅"
      });
    }

    if (text.trim() === config.prefix + "menu") {
      await sock.sendMessage(chat, {
        text:
          "🤖 MALIK FIAZ MD\n\n" +
          ".ping - Bot status\n" +
          ".menu - Commands"
      });
    }
  });
}

startBot().catch(console.error);
