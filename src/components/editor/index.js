import EditMap from '../edit-map'
import PlayMap from '../play-map'
import { CL, Comment } from '../code-text'

export default function Editor(props) {
  return (
    <div className="editor">
      {props.user ? (
        <div className='code'>
          <CL><Comment val="/*" /></CL>
          <CL><Comment val=" * Main entry point." /></CL>
          <CL><Comment val=" * Copyright Nick Barrow 2021." /></CL>
          <CL><Comment val=" *" /></CL>
          <CL><Comment val=" * HINT: Click a function name to run it." /></CL>
          <CL><Comment val=" */" /></CL>
          <CL></CL>

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