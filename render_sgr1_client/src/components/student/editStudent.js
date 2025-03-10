import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import InputStudentForm from "./inputStudentForm";
import { validateUrEmail, validateEmail } from "../../utilities/validateEmail";

export default function EditStudent(props) {
    const student = props.data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    //get only fields need for edit
    const needFormData = (({ id_stu, id, name, last_name, ur_mail, priv_mail, phone }) =>
        ({ id_stu, id, name, last_name, ur_mail, priv_mail, phone }))(student);
    const [formData, setFormData] = useState(needFormData);


    const handleSubmit = () => {
        setIsModalOpen(true);
    }
    const closeModal = () => {
        setIsModalOpen(false);
    };

    //handler for submit Form action
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        //put request
        try {
            // Check if ID already exists (this need to load availables id's)
            const responseAllIds = await fetch(`${process.env.REACT_APP_API_URL}/student/allids`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const jsonDataAllIds = await responseAllIds.json();
            const allIds = jsonDataAllIds.map((i) => Object.values(i)[0]);
            const allidsMinusQuery = allIds.filter((id) => id !== student.id);
            console.log("checking ids");
            console.log(allIds);
            console.log(allidsMinusQuery);
            console.log(student.id);

            if (allidsMinusQuery.includes(formData.id)) {
                // If the response is not ok, throw an error
                throw new Error('ID already exists');
            }
            if (!validateUrEmail(formData.ur_mail)) {
                throw new Error('UR Email should be of the form +@urosario.edu.co!');
            }

            if (formData.priv_mail !== "" && !validateEmail(formData.priv_mail)) {
                throw new Error('Private Email: not a valid email');
            }

            //copy row to be edited in db
            const responseCopy = await fetch(`${process.env.REACT_APP_API_URL}/student/copy/${student.id_stu}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );
            //finally update the row
            const response = await fetch(`${process.env.REACT_APP_API_URL}/student/edit/${student.id_stu}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                    credentials: "include"
                }
            );


            console.log("on handleSubmitForm");
            console.log(formData);
            if (!responseCopy.ok) {
                // If the response is not ok, throw an error
                const errorData = await responseCopy.json(); //parsing error from server side
                throw new Error(errorData.error || 'Failed to copy a student.');
            }

            if (!response.ok) {
                // If the response is not ok, throw an error
                const errorData = await response.json(); //parsing error from server side
                throw new Error(errorData.error || 'Failed to submit the Edit form. Please try again.');
            }
            alert("Student record updated successfully!");
            setIsModalOpen(false);
            props.clearsearch();

        } catch (err) {
            console.error(err.message);
            alert(err.message);
        }
    };

    //handler for change on form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        setFormData(needFormData);
    }, [props.data, needFormData]);

    return (

        <div >

            <Button label="Edit" onClick={handleSubmit} />

            <Dialog
                visible={isModalOpen}
                onHide={closeModal}
                header="Edit student"
            >
                <h2>Editable information</h2>
                <ul>
                    <li>id_stu: {student.id_stu}</li>
                    <li>id: {student.id}</li>
                    <li>Name: {student.name}</li>
                    <li>Last Name: {student.last_name}</li>
                    <li>email UR: {student.ur_mail}</li>
                    <li>email priv: {student.priv_mail}</li>
                    <li>phone: {student.phone}</li>
                </ul>

                <InputStudentForm
                    handleSubmit={handleSubmitForm}
                    formData={formData}
                    handleChange={handleChange}
                    title={"Edit Student"}
                />

                <Button onClick={closeModal} label="Close" />
            </Dialog>
        </div>



    );
}
