import React from 'react'
import css from 'styled-jsx/css'
import { AnalyticsDelayText } from './AnalyticsDelayText'

const overlayStyles = css`
    .overlayContainer {
        position: absolute;
        right: 0;
        bottom: 0;

        padding: 8px;
        background-color: #f4f6f8;
        border-radius: 4px 0 0;
    }
`

export const AnalyticsDelayOverlay = () => (
    <div className="overlayContainer">
        <style jsx>{overlayStyles}</style>
        <AnalyticsDelayText />
    </div>
)