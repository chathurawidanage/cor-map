
import { Sidebar } from "../../lib/layouts"
import { VisualizationParameters } from "./VisualizationParameters"
import i18n from "../../locales"

export const VisualizationSidebar = ({ visualization, parameters, setParameters, overflown }) => 
    <Sidebar className="flex flex-col flex-repel">
        {parameters ? <>
            <VisualizationParameters parameters={parameters} onSubmit={setParameters} />
            <span className="visualization-sidebar-text">{i18n.t('Click on a node in the graph to see details about the TEI')}</span>
        </> : <>
            <div />
            <span className="visualization-sidebar-text">{i18n.t('Select a date range and click Update to begin')}</span>
        </>}
    </Sidebar>