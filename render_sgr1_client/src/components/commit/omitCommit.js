import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { format } from 'date-fns';

export default function OmitCommit(props) {
    const commit = props.data;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        setIsModalOpen(true);
    };

    const handleOmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/commitment/omit/${commit.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            if (!response.ok) {
                // If the response is not ok, throw an error
                const errorData = await response.json(); //parsing error from server side
                throw new Error(errorData.error || 'Failed to omit commit.');
            }
            alert("commit omited successfully!");
            props.omitSent();
            closeModal();

        } catch (err) {
            console.error(err.message);
            alert(err.message);
        }
    };


    return (
        <div >
            <Button onClick={handleSubmit} label="Omit" severity="danger" />
            <Dialog
                visible={isModalOpen}
                onHide={closeModal}
                header="Warning"
            >
                <h2>Commit to ommit:</h2>
                <ul>
                    <li>commit id: {commit.id}</li>
                    <li>commit number: {commit.commit_num}</li>
                    <li>Enroll id: {commit.enroll_id}</li>
                    <li>Commit due date: {format(new Date(commit.due_date), 'MM/dd/yyyy')}</li>
                </ul>

                <h2>Are you sure to omit this commit? </h2>
                <p>state will change to "omited" and no appointments can be associted to it.</p>
                <Button onClick={closeModal} label="Cancel" severity="secondary" />
                <Button onClick={handleOmit} label="Omit" severity="danger" />
            </Dialog>
        </div>
    );
}
