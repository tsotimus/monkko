import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head, } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Monkko',
    template: '%s | Monkko'
  },
  description: 'The modern MongoDB ODM.',
  keywords: ['MongoDB', 'ODM', 'TypeScript', 'Node.js', 'Database', 'Type Safety'],
  authors: [{ name: 'Monkko Team' }],
  creator: 'Monkko',
  publisher: 'Monkko',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://monkko.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://monkko.dev',
    title: 'Monkko - The Modern MongoDB ODM',
    description: 'The Modern MongoDB ODM',
    siteName: 'Monkko',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monkko - The Modern MongoDB ODM',
    description: 'The Modern MongoDB ODM',
    creator: '@monkko_orm',
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
    logo={<b>Monkko</b>}
    projectLink='https://github.com/tsotimus/monkko'
  />
)
const footer = <Footer>MIT {new Date().getFullYear()} © Monkko.</Footer>
 
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
          docsRepositoryBase="https://github.com/tsotimus/monkko/tree/main/apps/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}