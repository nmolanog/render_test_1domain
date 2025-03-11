import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export default function DeleteProgram(props) {
    const program = props.data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [numEnroll, setNumEnroll] = useState([]);

    const handleSubmit = async () => {
        setIsModalOpen(true);
        try {
            // check if program has enrollments
            const responseNumEnroll = await fetch(`${process.env.REACT_APP_API_URL}/program/enrollmentsnum/${program.id}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const jsonDataANumEnroll = await responseNumEnroll.json();
            setNumEnroll(jsonDataANumEnroll[0].count);

        } catch (err) {
            console.error(err.message);
        }
    }

    const closeModal = () => {
        setIsModalOpen(false);
    };

    //handler for submit delete action
    const handleDelete = async (e) => {
        e.preventDefault();

        //put request
        try {
            //if enrollments already exists and duration is to be edited throw error
            if (numEnroll > 0) {
                throw new Error('enrollments for this program already exists, cannot delete');
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}/program/deactivate/${program.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );
            if (!response.ok) {
                // If the response is not ok, throw an error
                const errorData = await response.json(); //parsing error from server side
                throw new Error(errorData.error || 'Failed to delete program.');
            }
            alert("Program record deleted successfully!");
            props.setFormSubmitted(true);
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
                <h2>Program information</h2>
                <ul>
                    <li>id: {program.id}</li>
                    <li>Name: {program.name}</li>
                    <li>Duration: {program.duration}</li>
                </ul>
                <h2>Number of enrollments: {numEnroll}</h2>

                <h2>Are you sure to delete this registry? </h2>
                <Button onClick={closeModal} label="Cancel" severity="secondary"/>
                <Button onClick={handleDelete} label="Delete"  severity="danger"/>
            </Dialog>
        </div>
    );
}