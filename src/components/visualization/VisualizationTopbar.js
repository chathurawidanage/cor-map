import React from 'react'
import { Topbar } from '../../lib/layouts'
import { LinkButton } from '../helpers/LinkButton'
import { Button } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'

export const VisualizationTopbar = ({ id, name, onDelete }) => 
    <Topbar>
        <div className="grid-row grid-row-md">
            <div className="visualization-topbar-leftpane">
                <LinkButton secondary to={`/`}>&larr; {i18n.t('All visualizations')} {/*&larr; Back*/}</LinkButton>
            </div>
            <span className="visualization-title">
                {name}
            </span>
        </div>
        <div className="grid-row grid-sm">
            <LinkButton to={`/visualization/${id}/edit`}>{i18n.t("Edit")}</LinkButton>
            <Button destructive onClick={onDelete}>{i18n.t("Delete")}</Button>
        </div>
    </Topbar>