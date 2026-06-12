type Props = { code: string; className?: string }

export function FlagImg({ code, className = '' }: Props) {
  if (!code) return null
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={27}
      height={20}
      alt=""
      className={`inline-block rounded-sm object-cover shrink-0 ${className}`}
    />
  )
}
