import React, { useState, useEffect } from 'react';
import InputProgramForm from "./inputProgramForm";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import styles from "../styles.module.css";

export default function ProgInput() {
    const [programs, setPrograms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        duration: ''
    });

    const getPrograms = async () => {
        try {
            const response = await fetch("/program",
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const jsonData = await response.json();
            setPrograms(jsonData);

        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getPrograms();
    }, []);

    //handler for change on form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    //handler for submit action
    const handleSubmit = async (e) => {
        e.preventDefault();

        //post request
        try {

            // Check if ID already exists
            if (programs.some((data) => data.name === formData.name)) {
                throw new Error('Program already exists!');
            }
            const response = await fetch("/program/insert",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                    credentials: "include"
                }
            );
            if (!response.ok) {
                // If the response is not ok, throw an error
                throw new Error('Failed to submit the form. Please try again.');
            }
            // Show the modal on successful submission
            setIsModalOpen(true);

        } catch (err) {
            console.error(err.message);
            //alert('ID already exists!');
            alert(err.message);

        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            name: '',
            duration: ''
        });
    };

    return (
        <div className={styles.FormContainer}>
            <InputProgramForm
                handleSubmit={handleSubmit}
                formData={formData}
                handleChange={handleChange}
                title={"Register Program"}
            />
            <Dialog

                visible={isModalOpen}
                onHide={closeModal}
                header="Program Registered Successfully"            >
                <ul>
                    <li>Name: {formData.name}</li>
                    <li>Duration: {formData.duration}</li>
                </ul>
                <Button onClick={closeModal} label="Close" />
            </Dialog>
        </div>
    );
}
