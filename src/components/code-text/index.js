import './code-text.scss'

const Comment = (props) => {
  return <pre className='comment'>{props.val}</pre>
}

const Ctrl = (props) => {
  return <pre className='ctrl'>{props.val}</pre>
}

const Const = (props) => {
  return <pre className='const'>{props.val}</pre>
}

const Var = (props) => {
  return <pre className='var'>{props.name ? props.name : 'var'}</pre>
}

const CL = (props) => {
  return <div className={`codeLine ${props.className || ''}`}>{props.children}</div>
}

const Tb = () => {
  return <div style={{width: '2ch'}}></div>
}

const FN = (props) => {
  return (
    <div className='fn-def'>
      function <span className='fn' onClick={props.f}>{props.name}</span>
      {'('}{props.children}{') {'}
    </div>
  )
}

const AFN = (props) => {
  return (
    <div className='fn-def'>
      <Ctrl val="const" /><span className='fn' onClick={props.f}>{props.name}</span>
      {' = ('}{props.children}{') => {'}
    </div>
  )
}

module.exports = { CL, FN, Var, Const, Comment, Ctrl, Tb, AFN }