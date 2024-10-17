import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import CommitEnrollment from './commitEnrollment.js';
import DeleteEnrollment from './deleteEnrollment.js';
import { format } from 'date-fns';

export default function TableEnrollments({ enrollments = [], clearsearch = () => {}}) {
    const dateBodyTemplate = (rowData, field) => {
        return format(new Date(rowData[field]), 'MM/dd/yyyy');
      };

    return (
        <div >
            <h1>Available Enrollments</h1>
            <DataTable value={enrollments} stripedRows paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} >
                <Column field="enroll_id" header="Enroll ID" sortable />
                <Column field="student_id" header="Student Id" sortable/>
                <Column field="student_full_name" header="Student" sortable/>
                <Column field="program" header="Program" sortable/>
                <Column field="duration" header="Duration Mail" sortable/>
                <Column field="start_date_semester" header="Start date" 
                body={(rowData) => dateBodyTemplate(rowData, 'start_date_semester')} sortable/>
                <Column field="end_date" header="End date"
                body={(rowData) => dateBodyTemplate(rowData, 'end_date')} sortable/>
                <Column field="current_year" header="Current year" sortable/>
                <Column field="state" header="Status" sortable/>
                <Column header="" body={(rowData) => <CommitEnrollment data={rowData} clearsearch={clearsearch} />} />
                <Column header="" body={(rowData) => <DeleteEnrollment data={rowData} clearsearch={clearsearch} />} />
            </DataTable>

        </div>
    );
}