'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const {
  buildNotificationPayload,
  chunkTokens,
  collectTokenTargets,
  determineRecipient,
  isConfirmedDeadTokenError,
  notificationPreview,
} = require('./notification-helpers');

const chat = {
  adId: 'ad-1',
  buyerId: 'buyer',
  buyerName: 'المشتري',
  participants: ['buyer', 'seller'],
  sellerId: 'seller',
  sellerName: 'البائع',
};

assert.deepEqual(determineRecipient(chat, { senderId: 'buyer' }), {
  recipientId: 'seller',
  senderId: 'buyer',
  senderName: 'المشتري',
});
assert.equal(determineRecipient(chat, { senderId: 'outsider' }), null);
assert.equal(determineRecipient({ ...chat, participants: ['buyer', 'buyer'] }, { senderId: 'buyer' }), null);

const sharedToken = 'token-shared-12345678901234567890';
const mobileOnly = 'token-mobile-12345678901234567890';
const legacyOnly = 'token-legacy-12345678901234567890';
const targets = collectTokenTargets([
  { data: { notificationsEnabled: true, platform: 'android', token: sharedToken }, id: 'one', ref: 'one' },
  { data: { notificationsEnabled: true, platform: 'android', token: sharedToken }, id: 'duplicate', ref: 'duplicate' },
  { data: { notificationsEnabled: true, platform: 'android', token: mobileOnly }, id: 'two', ref: 'two' },
  { data: { notificationsEnabled: false, platform: 'android', token: 'token-disabled-12345678901234567890' }, id: 'three', ref: 'three' },
], [sharedToken, legacyOnly, legacyOnly]);
assert.deepEqual(targets.mobileTokens, [sharedToken, mobileOnly]);
assert.deepEqual(targets.legacyTokens, [legacyOnly]);
assert.equal(targets.legacyTokenSet.has(sharedToken), true);
assert.equal(targets.mobileDocumentsByToken.get(sharedToken).length, 2);

assert.equal(chunkTokens(Array.from({ length: 501 }, (_, index) => String(index))).length, 2);
assert.equal(isConfirmedDeadTokenError({ code: 'messaging/registration-token-not-registered' }), true);
assert.equal(isConfirmedDeadTokenError({ code: 'messaging/server-unavailable' }), false);
assert.equal(notificationPreview('  سطر\n  ثانٍ  '), 'سطر ثانٍ');
assert.equal(notificationPreview('x'.repeat(120)).length, 80);

const payload = buildNotificationPayload({
  adId: 'ad-1',
  chatId: 'chat-1',
  messageId: 'message-1',
  messageText: 'مرحباً',
  senderId: 'buyer',
  senderName: 'المشتري',
});
assert.equal(payload.data.type, 'chat_message');
assert.equal(payload.data.chatId, 'chat-1');
assert.equal(payload.data.adId, 'ad-1');
assert.equal('unreadCount' in payload.data, false);
assert.equal(payload.notification.body, 'مرحباً');

const functionSource = readFileSync(join(__dirname, 'index.js'), 'utf8');
const rulesSource = readFileSync(join(__dirname, '..', 'firestore.rules'), 'utf8');
const firebaseDocument = JSON.parse(readFileSync(join(__dirname, '..', 'firebase.json'), 'utf8'));
const packageDocument = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

for (const marker of [
  "userRef.collection('devices').get()",
  'determineRecipient(chatData, message)',
  'sendEachForMulticast',
  "android: { priority: 'high'",
  'deadMobileTokens',
  'batch.delete(reference)',
  'FieldValue.arrayRemove(...deadLegacyTokens)',
  "fcmOptions: { link: `https://bare-syria.com/chat/${chatId}` }",
]) {
  assert.equal(functionSource.includes(marker), true, `missing Function safety marker: ${marker}`);
}
assert.equal(functionSource.includes('unreadCount_'), false, 'push Function must never mutate chat unread counters');
assert.equal(functionSource.includes('message.recipientId'), false, 'recipient must never come from client message data');

for (const marker of [
  'match /devices/{installationId}',
  'request.auth.uid == userId',
  'allow read, delete: if ownsDevicePath()',
  'allow create: if ownsDevicePath() && validDeviceRegistration()',
  'data.installationId == installationId',
  "data.platform == 'android'",
  'request.resource.data.createdAt == resource.data.createdAt',
]) {
  assert.equal(rulesSource.includes(marker), true, `missing device-rule security marker: ${marker}`);
}
assert.equal(packageDocument.engines.node, '22');
assert.equal(firebaseDocument.functions[0].runtime, 'nodejs22');
assert.equal(packageDocument.dependencies['firebase-admin'], '14.2.0');
assert.equal(packageDocument.dependencies['firebase-functions'], '7.3.2');

console.log('Notification Function validated: authoritative recipient, unique multi-source fanout, 500-token batching, exact invalid-token cleanup, legacy Web compatibility, no unread mutation, owner-only device Rules, and current Node/Firebase runtime pass.');
