import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import EditProgram from './editProgram.js';
import DeleteProgram from './deleteProgram.js';

export default function TablePrograms(props) {
    return (
        <div >
            <h1>Available Programs</h1>
            <DataTable value={props.programs} stripedRows paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} >
                <Column field="id" header="ID" sortable />
                <Column field="name" header="Program name" sortable/>
                <Column field="duration" header="Program duration" sortable/>             
                <Column header="" body={(rowData) => <EditProgram 
                data={rowData} 
                setFormSubmitted={props.setFormSubmitted}
                />} />
                <Column header="" body={(rowData) => <DeleteProgram
                 data={rowData} 
                 setFormSubmitted={props.setFormSubmitted}
                 />} />
            </DataTable>
        </div>
    );
}