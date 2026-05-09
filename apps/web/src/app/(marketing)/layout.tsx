import NoveraNavbar from '@/components/novera-dark/NoveraNavbar';
import NoveraFooter from '@/components/novera-dark/NoveraFooter';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: '#0b1612', minHeight: '100vh' }}>
      <NoveraNavbar />
      <main>{children}</main>
      <NoveraFooter />
    </div>
  );
}
