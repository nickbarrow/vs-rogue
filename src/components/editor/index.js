import EditMap from '../edit-map'
import PlayMap from '../play-map'

export default function Editor(props) {
  return (
    <div className="editor">
      {props.user ? (
        <div className='code'>
          <PlayMap {...props} />
          <EditMap {...props} />
        </div>
      ) : (
        <div className='welcome'>
          <div className='options'>
            <img src="images/letterpress-dark.svg" alt="Dark VS Code Logo" />
          </div>
        </div>
      )}
    </div>
  )
}