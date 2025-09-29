import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
 
export const metadata = {
  title: 'Monko - TypeScript-first MongoDB ORM',
  description: 'The TypeScript-first MongoDB ORM that doesn\'t compromise on performance.',
}
 
const navbar = (
  <Navbar
    logo={<span className="font-bold text-xl">Monko</span>}
    project={{ link: 'https://github.com/your-org/monko' }}
  />
)

const footer = <Footer>MIT {new Date().getFullYear()} © Monko.</Footer>
 
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/your-org/monko/tree/main/apps/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}