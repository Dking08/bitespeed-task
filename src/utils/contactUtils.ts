import { Contact } from "../generated/prisma/client"

export function getPrimaryContact(contacts: Contact[]) {
  return contacts.reduce((oldest, current) => {
    return new Date(current.createdAt) < new Date(oldest.createdAt)
      ? current
      : oldest;
  });
}

export function hasNewInfo(
  contacts: Contact[],
  email?: string,
  phoneNumber?: number
) {

  const emails = contacts.map(c => c.email);
  const phones = contacts.map(c => c.phoneNumber);

  if (email && !emails.includes(email)) return true;
  if (phoneNumber && !phones.includes(phoneNumber)) return true;

  return false;
}
