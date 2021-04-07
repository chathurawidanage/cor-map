import React, { useState } from "react";
import {useDataQuery, useConfig} from '@dhis2/app-runtime';
import "./TEIDetailsModal.css";
import {trackedEntityInstanceQuery} from "../../queries/TEIQueries";
import i18n from "@dhis2/d2-i18n";
import { Modal, Chip, ModalContent, ModalActions, Button, Table, TableRow, TableBody, TableCell, TableHead, TableRowHead, TableCellHead } from "@dhis2/ui";
import { FullscreenLoader } from "../helpers/FullscreenLoader";

export const TEIDetailsModal = ({te, programs, onClose}) => {
    const {baseUrl} = useConfig();
    const {loading, error, data, refetch} = useDataQuery(trackedEntityInstanceQuery, {
        variables: {
            id: te.id,
            program: te.program
        }
    });

    const [activeProgram, setActiveProgram] = useState(te.program)

    const onChangeProgram = (program) => {
        if (program === activeProgram) return;
        setActiveProgram(program)
        refetch({ program })
    }

    const openInTracker = (programId) => {
        const url = `${baseUrl}/dhis-web-tracker-capture/index.html#/dashboard?tei=${te.id}&program=${programId}&ou=${data?.tei.orgUnit}`;
        window.open(url, "_blank");
    };

    return (
        <Modal onClose={onClose}>
            <ModalContent>
                {loading && <FullscreenLoader />}
                {error && i18n.t('An unknown error occurred!')}
                {data && (
                    <Table>
                        <TableHead>
                            <TableRowHead>
                                <TableCellHead>{i18n.t('Enrolled programs')}</TableCellHead>
                                <TableCellHead>{data.tei.enrollments.map(enrollment => {
                                    const programName = programs.find(program => program.id === enrollment.program)?.displayName
                                    return programName ? 
                                        <Chip 
                                            key={enrollment.program}
                                            selected={enrollment.program === activeProgram}
                                            onClick={() => onChangeProgram(enrollment.program)}
                                        >
                                            {programName}
                                        </Chip> 
                                        : null
                                })}</TableCellHead>
                            </TableRowHead>
                        </TableHead>
                        <TableBody>
                            {data.tei.attributes.map(att => 
                                <TableRow key={att.attribute}>
                                    <TableCell className="info-title">{att.displayName}</TableCell>
                                    <TableCell className="info-value">{att.value}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </ModalContent>
            <ModalActions>
                <Button
                    className="tei-modal-tracker-button"
                    onClick={() => openInTracker(activeProgram)}
                >
                    {i18n.t('Open in Tracker Capture')}
                </Button>
                <Button onClick={onClose}>{i18n.t('Hide')}</Button>
            </ModalActions>
        </Modal>
    );
};