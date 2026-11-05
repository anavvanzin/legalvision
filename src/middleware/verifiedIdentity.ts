export function hasVerifiedEmail(identity: { email_verified?: unknown }): boolean {
  return identity.email_verified === true;
}
