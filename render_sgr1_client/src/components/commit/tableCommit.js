import React from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import OmitCommit from './omitCommit';
const { utcDate } = require('../../utilities/dateFunctions');

export default function TableCommits({ commits = [], omitSent }) {
    const pendingCommits = commits.filter(commit => commit.state === "pending");
    //commit with max commit_num
    let maxCommitId;
    if (commits.length === 1) {
        maxCommitId = commits[0].id;
        
    } else if (commits.length > 1) {
        const maxCommit = commits.reduce((max, current) => {
            return current.commit_num > max.commit_num ? current : max;
        }, commits[0]);
        maxCommitId = maxCommit.id;
    }

    // Find the object with the minimum commit_num
    const minCommit = pendingCommits.reduce((min, commit) => {
        return (commit.commit_num < min.commit_num) ? commit : min;
    }, pendingCommits[0]);

    // Get the id of the object with minimum commit_num and state "pending"
    const resultId = minCommit ? minCommit.id : null;

    const formatDate = (value) => {
        return value ? utcDate(value) : 'NA';
    };

    const appointmentView = (rowData) => {
        if (rowData.state === "delivered" || rowData.id === resultId) {
            return <Link to={`/appointments/${rowData.id}`}>View</Link>;
        }
        return 'Unavailable';
    };

    const omitComitButton = (rowData) => {
        if (rowData.id === resultId && rowData.id !== maxCommitId) {
            return <OmitCommit data={rowData} omitSent={omitSent} />;
        } else {
            return <Button label="Omit" disabled severity="danger" />;
        }
    };

    return (
        <div>
            <h1>Schedule</h1>
            <DataTable value={commits} >
                <Column field="commit_num" header="Number" />
                <Column field="due_date" header="Due date" body={(rowData) => formatDate(rowData.due_date)} />
                <Column field="deliver_date" header="Deliver date" body={(rowData) => formatDate(rowData.deliver_date)} />
                <Column field="state" header="State" />
                <Column field="appointment" header="Appointments" body={appointmentView} />
                <Column field="omit" header="" body={omitComitButton} />
            </DataTable>
        </div>
    );
}