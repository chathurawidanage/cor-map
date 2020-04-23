import Legend from "./Legend"
import { Sidebar } from "../../lib/layouts"
import { VisualizationParameters } from "./VisualizationParameters"

export const VisualizationSidebar = ({ visualization, programs, parameters, setParameters }) => 
    <Sidebar className="flex flex-col flex-repel">
        <div className="grid-col grid-sm">
            <strong>Legend</strong>
            <Legend visualization={visualization} programs={programs}/>
        </div>
        {parameters ? <>
            <VisualizationParameters parameters={parameters} onSubmit={setParameters} />
            {/* <Legend visualization={visualization} programs={programs}/> */}
        </> : <>
            
            <span class="visualization-sidebar-text">Select a date range and click <strong>Update</strong> to begin</span>
        </>}
    </Sidebar>