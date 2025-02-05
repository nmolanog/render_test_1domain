import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
const { utcDate } = require('../utilities/dateFunctions');

export default function PendingDates() {

    const [pendingDates, setpendingDates] = useState([]);

    const getPendingDates = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/appointment/pending`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const jsonData = await response.json();
            setpendingDates(jsonData);

        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getPendingDates();
    }, []);

    const pendingDatesSummary = () => {
        if (pendingDates.length !== 0) {
            return (
                <div >
                    <h1>Pending dates</h1>
                    <DataTable value={pendingDates} stripedRows paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} >
                        <Column field="student_id" header="Student ID" sortable />
                        <Column field="student_full_name" header="Student Name" sortable />
                        <Column field="student_urmail" header="UR mail" sortable />
                        <Column field="program" header="Program" sortable />
                        <Column field="start_date_semester" header="Start date"
                            body={(rowData) => utcDate(rowData['start_date_semester'])} sortable />
                        <Column field="current_year" header="Current year" sortable />

                        <Column field="apo_set_date" header="Request date"
                            body={(rowData) => utcDate(rowData['start_date_semester'])} sortable />

                        <Column field="apo_date" header="appoinment date"
                            body={(rowData) => utcDate(rowData['start_date_semester'])} sortable />

                    </DataTable>
                </div>
            )
        } else {
            return (<h1> No appoinments pending</h1>);
        }
    }

    return (
        <div >
            {pendingDatesSummary()}
        </div>

    );
}