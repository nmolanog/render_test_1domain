import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { format } from 'date-fns';


export default function DeleteAppo(props) {

    const formatDate = (value) => {
        return value ? format(new Date(value), 'yyyy-MM-dd') : '';
    };
    const appointment = props.data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    //get only fields need for edit


    const handleSubmit = () => {
        setIsModalOpen(true);
    }
    const closeModal = () => {
        setIsModalOpen(false);
    };

    //handler for submit delete action
    const handleDelete = async (e) => {
        e.preventDefault();

        //put request
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/appointment/deactivate/${appointment.apo_id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );
            if (!response.ok) {
                // If the response is not ok, throw an error
                const errorData = await response.json(); //parsing error from server side
                throw new Error(errorData.error || 'Failed to delete appointment.');
            }
            alert("appointment record deleted successfully!");
            setIsModalOpen(false);
            props.updateForDelete();

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
                <h2>Appointment information</h2>
                <ul>
                    <li>Appointment id: {appointment.apo_id}</li>
                    <li>Set date: {formatDate(appointment.apo_set_date)}</li>
                    <li>Appointment date: {formatDate(appointment.apo_date)}</li>
                    <li>Fullfiled?: {appointment.apo_fullfiled}</li>
                    <li>Location: {appointment.apo_location}</li>
                    <li>Notes: {appointment.apo_obs}</li>

                </ul>
                <h2>Are you sure to delete this registry? </h2>
                <Button onClick={closeModal} label="Cancel" severity="secondary" />
                <Button onClick={handleDelete} label="Delete" severity="danger" />
            </Dialog>
        </div>



    );
}
