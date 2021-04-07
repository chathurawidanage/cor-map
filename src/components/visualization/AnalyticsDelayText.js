import React, { useState, useCallback } from 'react'
import classNames from 'classnames'
import css from 'styled-jsx/css'
import { useDataQuery } from '@dhis2/app-runtime'
import moment from 'moment'
import i18n from '@dhis2/d2-i18n'
import { Modal, ModalTitle, ModalContent, Button, ModalActions } from '@dhis2/ui'

const styles = css`
    .lastUpdatedText {
        font-size: 0.8rem;
        user-select: none;
        cursor: normal;
    }

    .interval {
        font-weight: bold;
    }

    .moreLink {
        margin-left: 8px;
        cursor: pointer;
        text-decoration: underline;
    }
`

const systemInfoQuery = {
    info: {
        resource: 'system/info'
    }
}

export const AnalyticsDelayText = ({ className }) => {
    const [showModal, setShowModal] = useState(false)
    const { loading, error, data } = useDataQuery(systemInfoQuery)

    const onClick = useCallback(e => {
        e.preventDefault();
        setShowModal(true)
    }, [])

    if (loading || error) {
        return null;
    }

    const lastUpdated = data.info.lastAnalyticsTableSuccess && moment(data.info.lastAnalyticsTableSuccess)
    const interval = lastUpdated && lastUpdated.fromNow()

    return <>
        <span className={classNames(className, 'lastUpdatedText')}>
            <style jsx>{styles}</style>
            {lastUpdated
                ? i18n.t('Last updated {{- timeAgo}}', {
                    timeAgo: interval
                })
                : i18n.t('Please generate analytics tables')
            }
            <a onClick={onClick} className="moreLink">{i18n.t('learn more')}</a>
        </span>
        {showModal && (
            <Modal onClose={() => setShowModal(false)}>
                <ModalTitle>About analytics delays</ModalTitle>
                <ModalContent>
                    {i18n.t('The analytics tables were last updated at {{time}} on {{date}}', {
                        time: lastUpdated.format('HH:MM'),
                        date: lastUpdated.format('YYYY-MM-DD')
                    })}
                </ModalContent>
                <ModalActions>
                    <Button onClick={() => setShowModal(false)}>Hide</Button>
                </ModalActions>
            </Modal>
        )}
    </>
}