'use strict';

const MAX_MULTICAST_TOKENS = 500;
const CONFIRMED_DEAD_TOKEN_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function determineRecipient(chatData, messageData) {
  const participants = Array.isArray(chatData && chatData.participants)
    ? chatData.participants.filter(participant => typeof participant === 'string' && participant)
    : [];
  const senderId = cleanString(messageData && messageData.senderId);
  if (participants.length !== 2 || new Set(participants).size !== 2 || !participants.includes(senderId)) {
    return null;
  }
  const recipientId = participants.find(participant => participant !== senderId);
  if (!recipientId) return null;

  const senderName = senderId === chatData.buyerId
    ? cleanString(chatData.buyerName)
    : senderId === chatData.sellerId
      ? cleanString(chatData.sellerName)
      : '';
  return {
    recipientId,
    senderId,
    senderName: senderName || 'مستخدم Bare',
  };
}

function notificationPreview(value) {
  const compact = cleanString(value).replace(/\s+/g, ' ');
  if (!compact) return 'لديك رسالة جديدة في Bare';
  return compact.length > 80 ? `${compact.slice(0, 79)}…` : compact;
}

function buildNotificationPayload(input) {
  const chatId = cleanString(input.chatId);
  const messageId = cleanString(input.messageId);
  const senderId = cleanString(input.senderId);
  const senderName = cleanString(input.senderName) || 'مستخدم Bare';
  if (!chatId || !messageId || !senderId) throw new Error('notifications/invalid-payload-context');
  const title = `رسالة جديدة من ${senderName}`;
  const body = notificationPreview(input.messageText);
  return {
    data: {
      adId: cleanString(input.adId),
      body,
      chatId,
      messageId,
      senderId,
      title,
      type: 'chat_message',
      url: `/chat/${chatId}`,
    },
    notification: { body, title },
  };
}

function validToken(value) {
  const token = cleanString(value);
  return token.length >= 20 && token.length <= 4096 ? token : null;
}

function collectTokenTargets(deviceDocuments, legacyValues) {
  const mobileDocumentsByToken = new Map();
  for (const device of deviceDocuments) {
    const data = device && device.data;
    const token = validToken(data && data.token);
    if (!token || data.platform !== 'android' || data.notificationsEnabled !== true) continue;
    const existing = mobileDocumentsByToken.get(token) || [];
    existing.push(device);
    mobileDocumentsByToken.set(token, existing);
  }
  const mobileTokens = [...mobileDocumentsByToken.keys()];
  const mobileSet = new Set(mobileTokens);
  const legacyTokenSet = new Set((Array.isArray(legacyValues) ? legacyValues : [])
    .map(validToken)
    .filter(Boolean));
  const legacyTokens = [...legacyTokenSet].filter(token => !mobileSet.has(token));
  return { legacyTokens, legacyTokenSet, mobileDocumentsByToken, mobileTokens };
}

function chunkTokens(tokens) {
  const chunks = [];
  for (let offset = 0; offset < tokens.length; offset += MAX_MULTICAST_TOKENS) {
    chunks.push(tokens.slice(offset, offset + MAX_MULTICAST_TOKENS));
  }
  return chunks;
}

function isConfirmedDeadTokenError(error) {
  return Boolean(error && CONFIRMED_DEAD_TOKEN_CODES.has(error.code));
}

module.exports = {
  buildNotificationPayload,
  chunkTokens,
  collectTokenTargets,
  determineRecipient,
  isConfirmedDeadTokenError,
  notificationPreview,
};
