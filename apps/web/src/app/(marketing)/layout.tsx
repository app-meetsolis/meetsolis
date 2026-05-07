import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontFamily: 'Geist, Plus Jakarta Sans, sans-serif',
        backgroundColor: '#0b1612',
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <div style={{ height: '80px' }} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
