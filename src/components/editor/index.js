import './editor.scss'
import LineNumbers from '../line-numbers'
import EditMap from '../edit-map'
import PlayMap from '../play-map'

export default function Editor(props) {

  return (
    <div className="editor">
      {/* <LineNumbers count={30} /> */}

      <div className='code'>
        {props.user && <PlayMap {...props} />}
        <EditMap {...props} />
      </div>
    </div>
  )
}