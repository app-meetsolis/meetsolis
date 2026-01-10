import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clients | MeetSolis',
  description: 'Manage your professional relationships',
};

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
