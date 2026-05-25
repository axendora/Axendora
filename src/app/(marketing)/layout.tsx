import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { BackgroundMeta } from '@/components/marketing/background-meta'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BackgroundMeta />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
