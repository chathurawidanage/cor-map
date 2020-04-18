import Visualization from "../visualization/Visualization"
import {useDataEngine} from "@dhis2/app-runtime"
import {useSavedObject} from "../../services/dataStore/useSavedObject"
import {useParams, Redirect, Link} from "react-router-dom";
import {Button, MenuItem, Menu} from "@dhis2/ui-core";
import Legend from "../visualization/Legend";
import { useDataQuery } from "@dhis2/app-runtime";
import { programsQuery } from "../../queries/TEIQueries";
import i18n from "../../locales";
import Loader from "../loader/Loader";
import { LinkButton } from "../helpers/LinkButton";

export const VisualizationPage = () => {
    const { id } = useParams();
    const engine = useDataEngine()
    const [visualization, {remove}] = useSavedObject(id)
    const { loading, error, data } = useDataQuery(programsQuery)

    if (!id || !visualization) {
        return <Redirect to="/"/>
    }

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <div>{i18n.t('An error occurred!')}</div>
    }

    const programs = data.ps.programs;

    const onDelete = () => {
        if (window.confirm(
            i18n.t(
                'Are you sure you want to delete the visualization "{{ visualizationName }}"?  This cannot be undone.',
                {
                    visualizationName: visualization.name
                }
            )
        )) {
            remove()
        }
    }

    return <div className="visualization-page">
        <div className="visualization-topbar">
            <LinkButton secondary to={`/`}>&lt;</LinkButton>
            <span className="visualization-title">
                {visualization.name}
            </span>
            {/* <div>
                <Button><HamburgerIcon /></Button>
                <Menu><MenuItem label="Testing" /></Menu>
            </div> */}
            <div className="visualization-buttons">
                <LinkButton to={`/visualization/${id}/edit`}>Edit</LinkButton>
                <Button destructive onClick={onDelete}>Delete</Button>
            </div>
        </div>
        <div className="visualization-canvas">
            <Visualization engine={engine} visualization={visualization} programs={programs}/>
            <Legend visualization={visualization} programs={programs}/>
        </div>
    </div>
    // return <Visualization engine={engine} visualization={visualization} />
}