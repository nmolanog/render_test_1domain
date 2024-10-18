import React, { useState, useEffect } from 'react';
import InputStudentForm from "./inputStudentForm";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { validateUrEmail, validateEmail } from "../../utilities/validateEmail";
import styles from "../styles.module.css";


export default function InputStudents() {

    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        last_name: '',
        ur_mail: '',
        priv_mail: '',
        phone: ''
    });

    const getstudents = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/student`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include" 
                });
            const jsonData = await response.json();
            setStudents(jsonData);

        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getstudents();
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
            if (students.some((data) => data.id === formData.id)) {
                throw new Error('ID already exists!');
            }

            if(!validateUrEmail(formData.ur_mail)){
                throw new Error('UR Email should be of the form +@urosario.edu.co!');
            }

            if(formData.priv_mail !== "" && !validateEmail(formData.priv_mail)){
                throw new Error('Private Email: not a valid email');
            }
            const response = await fetch(`${process.env.REACT_APP_API_URL}/student/insert`,
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
            id: '',
            name: '',
            last_name: '',
            ur_mail: '',
            priv_mail: '',
            phone: ''
        });
    };

    return (

        <div className={styles.FormContainer}>
            <InputStudentForm 
            handleSubmit={handleSubmit} 
            formData={formData}
            handleChange={handleChange}
            title= {"Sign in Student"}
            
            />
            <Dialog
                visible={isModalOpen}
                onHide={closeModal}
                header="Student Registered Successfully"
            >
                <ul>
                    <li>id: {formData.id}</li>
                    <li>Name: {formData.name}</li>
                    <li>Last Name: {formData.last_name}</li>
                    <li>email UR: {formData.ur_mail}</li>
                    <li>email priv: {formData.priv_mail}</li>
                    <li>phone: {formData.phone}</li>
                </ul>
                <Button onClick={closeModal}label="Close" />
            </Dialog>

        </div>



    );
}
