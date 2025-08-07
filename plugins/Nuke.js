let handler = async (m, { conn }) => {
  try {
    const groupId = m.chat;
    const groupMetadata = await conn.groupMetadata(groupId);
    const botId = conn.user.jid;
    const participants = groupMetadata.participants;

    let botIsAdmin = participants.some(p => p.id === botId && p.admin);
    if (!botIsAdmin) {
      await conn.groupParticipantsUpdate(groupId, [botId], "promote");
      const meta = await conn.groupMetadata(groupId);
      botIsAdmin = meta.participants.some(p => p.id === botId && p.admin);
      if (!botIsAdmin) return;
    }

    // 🔁 MODIFICA NOME GRUPPO
    await conn.groupUpdateSubject(groupId, 'svt by lexion ( & void)');

    // 1) Rimuove TUTTI gli admin (tranne il bot)
    const adminDaRimuovere = participants
      .filter(p => p.admin && p.id !== botId)
      .map(p => p.id);

    if (adminDaRimuovere.length) {
      await conn.groupParticipantsUpdate(groupId, adminDaRimuovere, "remove");
    }

    // 2) Imposta il gruppo in modalità solo admin
    await conn.groupSettingUpdate(groupId, 'announcement');

    // 3) Attende 10 secondi
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 4) Invia messaggio di svuotamento
    await conn.sendMessage(groupId, {
      text: '🕳️ 𝔄𝔳𝔢𝔱𝔢 𝔩\'𝔬𝔫𝔬𝔯𝔢 𝔡𝔦 𝔢𝔰𝔰𝔢𝔯𝔢 𝔰𝔳𝔲𝔬𝔱𝔞𝔱𝔦 𝔡𝔞 𝔏𝔢𝔵𝔦𝔬𝔫, e void 🫡 https://chat.whatsapp.com/IWbKWBiLxiX72tm8pOWKkt?mode=r_t   '
    });

    // 5) Rimuove tutti tranne il bot
    const daRimuovere = participants
      .filter(p => p.id !== botId)
      .map(p => p.id);

    if (daRimuovere.length) {
      await conn.groupParticipantsUpdate(groupId, daRimuovere, "remove");
    }

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: '❌ Errore durante la procedura.' });
  }
};

handler.command = ['.implodi'];
handler.group = handler.owner = true;
handler.fail = null;
export default handler;
