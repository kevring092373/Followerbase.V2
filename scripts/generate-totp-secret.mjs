/**
 * Einmal ausführen, um ein TOTP-Secret für den Admin-2FA zu erzeugen.
 * Ausgabe: ADMIN_TOTP_SECRET und otpauth-URL für die Authenticator-App (z. B. Google Authenticator).
 *
 * Aufruf: node scripts/generate-totp-secret.mjs
 *
 * Das Secret in .env.local und in Netlify (Site → Environment) als ADMIN_TOTP_SECRET eintragen.
 * Die otpauth-URL kannst du in einen QR-Code-Generator kopieren und mit der App scannen.
 */

import { generateSecret, generateURI } from "otplib";

const secret = generateSecret();
const uri = generateURI({
  secret,
  issuer: "Followerbase",
  label: "Admin",
});

console.log("\n--- Admin 2FA (TOTP) ---\n");
console.log("In .env.local und Netlify eintragen:");
console.log("ADMIN_TOTP_SECRET=" + secret);
console.log("\nQR-Code / manuell in Authenticator-App:");
console.log(uri);
console.log("\nOptional: URL in https://www.qr-code-generator.com/ o. ä. einfügen → QR scannen.\n");
