import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { format } from 'date-fns';
import { Button } from 'primereact/button';
import DeleteAppo from './deleteAppo.js';

export default function TableAppointments({ appointment = [],updateForDelete }) {
    const formatDate = (value) => {
        return value ? format(new Date(value), 'yyyy-MM-dd') : '';
    };

    return (
        <div>
            <DataTable value={appointment} >
                <Column 
                    field="apo_set_date" 
                    header="Set date" 
                    body={(rowData) => formatDate(rowData.apo_set_date)} 
                />
                <Column 
                    field="apo_date" 
                    header="Appointment date" 
                    body={(rowData) => formatDate(rowData.apo_date)} 
                />
                <Column field="apo_fullfiled" header="Fullfiled?" />
                <Column field="apo_location" header="Location" />
                <Column field="apo_obs" header="Notes" />
                <Column field="apo_end_commit" header="End commit?" />
                <Column header="" body={(rowData) => {
                    return(rowData.commit_state === "pending" && rowData.apo_fullfiled!=="pending" ? 
                    (<DeleteAppo data={rowData} updateForDelete={updateForDelete} />):(<Button label="Delete" severity="danger" disabled/>)
                    );
                }} />
                
            </DataTable>
        </div>
    );
}