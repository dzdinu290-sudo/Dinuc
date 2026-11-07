const express = require('express');
const axios = require('axios');
const ytdlp = require('youtube-dl-exec');
const app = express();
app.use(express.json());

// --- මෙතන ඔයාගේ විස්තර දාන්න ---
const VERIFY_TOKEN = "blackbyte123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAoaQxR9ZCCcBSw0f3AMq5WY3oCwCKKOjzcVMP0UfIdbZCiAHiqrFxb0sjEXmA0b4RZCy1HACfP0IxyRJiv2YAIvmCPOcGuXdarpZAH4XM4HJZAgi5y1jXGFsAKrReyCewtZBZBBHmZAe2Eg4cQh2ixglMZBJ57rYcY9n40P31SjPknG4AFvRfwzGM8n7BexUiWZClsKaJGqT5U26gX1hzIJxDr97I30ytX0KSqZCJV4sEruKZAZC4Ec5CJCCvmiYnMgw1pDCFZAHgi5Qt1MK7nVFPhevg0JlJ";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "1422013724332722";

// Webhook Verify
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else { res.sendStatus(403); }
});

// Message එකක් ආවම
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg || !msg.text) return;
    
    const userText = msg.text.body.trim();
    const from = msg.from;

    // Hi කිව්වොත්
    if (userText.toLowerCase() === 'hi' || userText.toLowerCase() === 'hello') {
      await sendWhatsApp(from, "👋 අඩෝ BlackByte Downloader එකට Welcome!\n\nYouTube / TikTok / Insta / FB Link එකක් එවන්න, මම Download Link එක දෙන්නම්.\n\nSong එකක් ඕන නම්: *song* + නම එවන්න\nඋදා: song Alan Walker Faded");
      return;
    }

    // Song Search එක
    if (userText.toLowerCase().startsWith('song ')) {
      const songName = userText.substring(5);
      await sendWhatsApp(from, `🎵 "${songName}" හොයනවා...`);
      const info = await ytdlp(`ytsearch1:${songName}`, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        format: 'bestaudio[ext=m4a]/bestaudio'
      });
      await sendWhatsApp(from, `✅ හම්බුණා!\n🎵 Title: ${info.title}\n👤 Channel: ${info.uploader}\n🔗 Download Link: ${info.url}\n\nLink එක Click කරලා Download කරගන්න.`);
      return;
    }

    // Link එකක්නම් Download කරනවා
    if (userText.includes("http")) {
      await sendWhatsApp(from, "⏳ Download කරනවා මචන්... ටිකක් ඉන්න...");

      let platform = "Video";
      if (userText.includes("youtube") || userText.includes("youtu.be")) platform = "YouTube";
      else if (userText.includes("tiktok")) platform = "TikTok";
      else if (userText.includes("instagram")) platform = "Instagram";
      else if (userText.includes("facebook") || userText.includes("fb.watch")) platform = "Facebook";

      const info = await ytdlp(userText, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        format: 'best[ext=mp4]/best'
      });

      await sendWhatsApp(from, `✅ ${platform} - Download Ready!\n\n📌 Title: ${info.title}\n⏱️ Duration: ${Math.floor(info.duration / 60)}:${(info.duration % 60).toString().padStart(2, '0')}\n\n🔗 Video Link: ${info.url}\n\nLink එක උඩ Click කරලා Save කරගන්න. WhatsApp එකෙන් 16MB ට වඩා ලොකු File යවන්න බැරි නිසා Link එක විදිහට එව්වේ.`);
      return;
    }

    await sendWhatsApp(from, "Link එකක් එවන්න මචන්! නැත්තන් *song* + නම එවන්න.");
  } catch (e) {
    console.log("Error: " + e.message);
    // Error ආවොත් User ට කියනවා
    try {
      const from = req.body.entry[0].changes[0].value.messages[0].from;
      await sendWhatsApp(from, "❌ මචන් ඒ Link එක Download කරන්න බැරි වුණා. Private Video එකක් වෙන්න ඇති. වෙන Link එකක් try කරලා බලන්න.");
    } catch(err) {}
  }
});

async function sendWhatsApp(to, body) {
  await axios.post(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    to: to,
    text: { body: body }
  }, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
}

app.get('/', (req, res) => res.send("BlackByte Downloader Bot Online 🔥"));
app.listen(3000, () => console.log("Bot Online"));
