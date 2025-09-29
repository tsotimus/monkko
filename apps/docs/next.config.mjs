import nextra from 'nextra'

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false
  }
})

export default withNextra({
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    turbopack: {
        resolveAlias: {
        // Path to your `mdx-components` file with extension
        'next-mdx-import-source-file': './mdx-components.tsx'
        }
    }
})