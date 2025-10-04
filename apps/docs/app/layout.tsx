import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head, } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Monko',
    template: '%s | Monko'
  },
  description: 'The modern MongoDB ORM.',
  keywords: ['MongoDB', 'ORM', 'TypeScript', 'Node.js', 'Database', 'Type Safety'],
  authors: [{ name: 'Monko Team' }],
  creator: 'Monko',
  publisher: 'Monko',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://monko.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://monko.dev',
    title: 'Monko - The Modern MongoDB ORM',
    description: 'The Modern MongoDB ORM',
    siteName: 'Monko',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monko - The Modern MongoDB ORM',
    description: 'The Modern MongoDB ORM',
    creator: '@monko_orm',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
 

const navbar = (
  <Navbar
    logo={<b>Monko</b>}
    projectLink='https://github.com/tsotimus/monko'
  />
)
const footer = <Footer>MIT {new Date().getFullYear()} © Monko.</Footer>
 
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
    >
      <Head
      >
      </Head>
      <body>
        <Layout
          sidebar={{ autoCollapse: true }}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/tsotimus/monko/tree/main/apps/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}