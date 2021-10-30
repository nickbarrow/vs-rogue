import { useState } from "react"
import { VscChromeClose } from "react-icons/vsc"
import { SiJavascript } from "react-icons/si";

export default function TopNav (props) {
    const [activeTab, setActiveTab] = useState(0)
    
    return (
        <div className="tabs">
            <div className={`tab ${activeTab === 0 ? 'active' : ''}`}
                onClick={() => { setActiveTab(0) }}>
                <SiJavascript color={"rgb(255, 202, 40)"} />
                <span>main.js</span>
                <div className="close"><VscChromeClose /></div>
            </div>
            <div className={`tab ${activeTab === 1 ? 'active' : ''}`}
                onClick={() => { setActiveTab(1) }}>
                <SiJavascript color={"rgb(255, 202, 40)"} />
                <span>saveAs.json</span>
                <div className="close"><VscChromeClose /></div>
            </div>
        </div>
    )
}