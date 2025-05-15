import { authenticator } from 'otplib';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

function generateOTP(secret) {
  return authenticator.generate(secret);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateOTP') {
    const otp = generateOTP(request.secret);
    sendResponse({ otp });
  }
});
