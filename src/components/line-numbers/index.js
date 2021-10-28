export default function LineNumbers(props) {
  var lines = [];
  for (let i = 1; i <= props.count; i++)
    lines.push(<div className='line' key={i}>{i}</div>)

  return (
    <div className="line-numbers">
      {lines}
    </div>
  )
}