const fallbackSiteUrl = 'https://imovel-sp-mvp.vercel.app'

function cleanSiteUrl(value: string) {
  return value.trim().replace(/\/+$/, '')
}

export const siteConfig = {
  name: 'ImovelSP',
  description: 'Compare precos de imoveis em Sao Paulo e encontre oportunidades com preco justo.',
  url: cleanSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl),
}

export function absoluteUrl(path = '/') {
  return new URL(path, `${siteConfig.url}/`).toString()
}
