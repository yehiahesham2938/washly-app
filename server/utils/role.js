/**
 * Admin if the email domain is exactly `admin` (e.g. user@admin) or `admin.com`
 * (matches client AuthContext inferRole for *@admin.com and extends to *@admin).
 */
function inferRoleFromEmail(email) {
  const lower = String(email).trim().toLowerCase();
  const at = lower.lastIndexOf('@');
  if (at === -1) return 'user';
  const domain = lower.slice(at + 1);
  if (domain === 'admin' || domain === 'admin.com') return 'admin';
  return 'user';
}

module.exports = { inferRoleFromEmail };
