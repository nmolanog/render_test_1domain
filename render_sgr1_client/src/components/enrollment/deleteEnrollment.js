import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { format } from 'date-fns';

export default function DeleteEnrollment(props) {
    const enroll = props.data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [numAppo, setNumAppo] = useState([]);

    const handleSubmit = async () => {
        setIsModalOpen(true);
        try {
            // check if program has enrollments
            const responseNumAppo = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/appointmentsnum/${enroll.enroll_id}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const jsonDataNumAppo = await responseNumAppo.json();
            setNumAppo(jsonDataNumAppo[0].count);

        } catch (err) {
            console.error(err.message);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        props.clearsearch();
    };

    //handler for submit delete action
    const handleDelete = async (e) => {
        e.preventDefault();

        //put request
        try {
            //if enrollments already exists and duration is to be edited throw error
            /*
            if (numAppo > 0) {
                throw new Error('Appointments for this enrollment already exists, cannot delete');
            }
*/
            const response = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/deactivate/${enroll.enroll_id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );
            if (!response.ok) {
                // If the response is not ok, throw an error
                const errorData = await response.json(); //parsing error from server side
                throw new Error(errorData.error || 'Failed to delete enrollment.');
            }
            alert("Enrollment record deleted successfully!");
            closeModal();

        } catch (err) {
            console.error(err.message);
            alert(err.message);
        }
    };

    return (
        <div >
            <Button onClick={handleSubmit} label="Delete" severity="danger" />
            <Dialog
                visible={isModalOpen}
                onHide={closeModal}
                header="Warning"
            >
                <h2>Enrollment information:</h2>
                <ul>
                    <li>id: {enroll.enroll_id}</li>
                    <li>Student id: {enroll.student_id}</li>
                    <li>Student name: {enroll.student_full_name}</li>
                    <li>Program: {enroll.program}</li>
                    <li>Program duration: {enroll.duration}</li>
                    <li>Start date: {format(new Date(enroll.start_date_semester), 'MM/dd/yyyy')}</li>
                    <li>End date: {format(new Date(enroll.end_date), 'MM/dd/yyyy')}</li>
                </ul>
                <h2>Number of Appointments: {numAppo}</h2>

                <h2>Are you sure to delete this registry? </h2>
                <p>All information on commits and appointments will be deleted</p>
                <Button onClick={closeModal} label="Cancel" severity="secondary" />
                <Button onClick={handleDelete} label="Delete" severity="danger" />
            </Dialog>
        </div>
    );
}
