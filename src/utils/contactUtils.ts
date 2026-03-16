import { Contact } from "../generated/prisma/client"
import { prisma } from "../prisma";
import { LinkPrecedence } from '../generated/prisma/enums';

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

export async function expandCluster(contacts: any[]) {

  const ids = new Set<number>();
  contacts.forEach(c => {
    ids.add(c.id);
    if (c.linkedId) ids.add(c.linkedId);
  });
  const cluster = await prisma.contact.findMany({
    where: {
      OR: [
        { id: { in: [...ids] } },
        { linkedId: { in: [...ids] } }
      ]
    }
  });

  return cluster;
}

export async function normaliseCluster(cluster: any[]) {

  const primary = getPrimaryContact(cluster);
  for (const contact of cluster) {
    if (contact.id === primary.id) continue;
    if (
      contact.linkPrecedence !== LinkPrecedence.secondary ||
      contact.linkedId !== primary.id
    ) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          linkPrecedence: LinkPrecedence.secondary,
          linkedId: primary.id
        }
      });
    }
  }

  return primary;
}
