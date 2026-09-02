interface IProps {
  count: number
  duration?: number
}

function CountText({ count }: IProps) {
  return <span>{count}</span>
}

CountText.displayName = "CountText"
export default CountText
