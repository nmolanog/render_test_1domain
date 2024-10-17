import React from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import EditStudent from './editStudent.js';
import DeleteStudent from './deleteStudent.js';

export default function TableStudents(props) {


    return (
        <div >
            <h1>Available students</h1>
            <DataTable value={props.students} stripedRows paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} >
                <Column field="id" header="ID" sortable />
                <Column field="name" header="Name" sortable/>
                <Column field="last_name" header="Last Name" sortable/>
                <Column field="ur_mail" header="UR Mail" sortable/>
                <Column field="priv_mail" header="Private Mail" sortable/>
                <Column field="phone" header="Phone" sortable/>
                <Column header="" body={(rowData) => <EditStudent data={rowData} clearsearch={props.clearsearch} />} />
                <Column header="" body={(rowData) => <DeleteStudent data={rowData} clearsearch={props.clearsearch} />} />
            </DataTable>
        </div>
    );
}

