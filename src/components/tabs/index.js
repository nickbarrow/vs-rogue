import { useState } from "react"
import { VscChromeClose } from "react-icons/vsc"
import { SiJavascript } from "react-icons/si";
import { VscJson } from 'react-icons/vsc'

export default function TopNav (props) {
    const [activeTab, setActiveTab] = useState(0)
    
    return (
        <div className="tabs">
            <div className={`tab ${activeTab === 0 ? 'active' : ''}`}
                onClick={() => { setActiveTab(0) }}>
                <SiJavascript color={"rgb(255, 202, 40)"} />
                <span>App.js</span>
                <div className="close"><VscChromeClose /></div>
            </div>
            <div className={`tab ${activeTab === 1 ? 'active' : ''}`}
                onClick={() => { setActiveTab(1) }}>
                <VscJson color={"rgb(255, 202, 40)"} />
                <span>testData.json</span>
                <div className="close"><VscChromeClose /></div>
            </div>
        </div>
    )
}