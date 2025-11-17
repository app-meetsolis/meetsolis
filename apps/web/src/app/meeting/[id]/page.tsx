/**
 * Meeting Room Page
 * Main video call interface for active meetings
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { MeetingRoomClient } from './MeetingRoomClient';

export const metadata = {
  title: 'Meeting Room | MeetSolis',
  description: 'Join your video meeting',
};

interface MeetingPageProps {
  params: {
    id: string;
  };
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { userId } = await auth();

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect(`/sign-in?redirect_url=/meeting/${params.id}`);
  }

  return <MeetingRoomClient meetingId={params.id} userId={userId} />;
}
