import { Visualization } from "../visualization/Visualization"
import { useDataEngine } from "@dhis2/app-runtime"
import { useSavedObject } from "@dhis2/app-service-datastore"
import { useParams, useLocation, Redirect, useHistory } from "react-router-dom";
import { useDataQuery } from "@dhis2/app-runtime";
import { programsQuery } from "../../queries/TEIQueries";
import i18n from "../../locales";
import { useState } from "react";

import { TopbarLayout, SidebarLayout } from '../../lib/layouts'
import { VisualizationTopbar } from "../visualization/VisualizationTopbar";
import { VisualizationSidebar } from "../visualization/VisualizationSidebar";
import { VisualizationParameters } from "../visualization/VisualizationParameters";
import { CenteredMessageLoader } from "../helpers/CenteredMessageLoader";

const parseQuery = (queryString) => 
    queryString
        .replace(/^\?/, '')
        .split('&')
        .map(param => param.split('='))
        .filter(([key, value]) =>
            ['startDate', 'endDate'].includes(key) &&
            value && value.match(/^\d{4}-\d{2}-\d{2}$/))
        .reduce((acc = {}, [key, value]) => {
            acc[key] = value
            return acc
        }, undefined)

const stringifyQuery = (parameters) => {
    const searchParams = new URLSearchParams()
    Object.entries(parameters).forEach(([key, value]) => {
        if (value && String(value).length) {
            searchParams.set(key, value)
        }
    })
    return '?' + searchParams
}

const promptForDelete = (name) => 
    window.confirm(
        i18n.t(
            'Are you sure you want to delete the visualization "{{ name }}"?  This cannot be undone.', 
            { name }
        )
    )

export const VisualizationPage = () => {
    const query = parseQuery(useLocation().search)
    const history = useHistory()
    const { id } = useParams();
    const engine = useDataEngine()
    const [visualization, {remove}] = useSavedObject(id)
    const { loading, error, data } = useDataQuery(programsQuery)

    const [parameters, setParameters] = useState(query ?? undefined)

    const updateParameters = parameters => {
        setParameters(parameters)
        history.push(stringifyQuery(parameters))
    }

    if (!id || !visualization) {
        return <Redirect to="/"/>
    }

    if (loading) {
        return <CenteredMessageLoader message={i18n.t('Loading visualization...')} />
    }

    if (error) {
        return <div>{i18n.t('An error occurred!')}</div>
    }

    const programs = data.ps.programs;

    const onDelete = () => {
        if (promptForDelete(visualization.name)) {
            remove()
        }
    }

    return <>
        <TopbarLayout>
            <VisualizationTopbar id={id} name={visualization.name} onDelete={onDelete}/>
            <SidebarLayout>
                {<VisualizationSidebar
                    visualization={visualization}
                    parameters={parameters}
                    setParameters={updateParameters}
                />}
                <div className="visualization-canvas-inner">
                    {parameters ? (
                        <Visualization
                            engine={engine}
                            visualization={visualization}
                            programs={programs}
                            parameters={parameters}
                        />
                    ) : <div className="visualization-hero">
                        <VisualizationParameters parameters={parameters} onSubmit={updateParameters} />
                    </div>}
                </div>
            </SidebarLayout>
        </TopbarLayout>
    </>
}