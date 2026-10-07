import Link from 'next/link'
export default function Output({ children, href }) {
  const isMyPageLink = href.startsWith('/') || href === ''
  return isMyPageLink ? (
    <Link legacyBehavior href={href}>
      <a>{children}</a>
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
