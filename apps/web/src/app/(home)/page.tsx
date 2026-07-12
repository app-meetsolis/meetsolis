export const metadata = {
  title: 'MeetSolis — Coming Soon',
  description: 'MeetSolis is on pause. Check back soon.',
};

export default function HomePage() {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#0b1612' }}
    >
      <p className="text-xl font-medium text-white sm:text-2xl">
        MeetSolis is taking a break — coming back soon.
      </p>
    </main>
  );
}
