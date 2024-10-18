import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import InputProgramForm from "./inputProgramForm";

export default function EditProgram(props) {
    const program = props.data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const needFormData = (({ id, name, duration }) =>
        ({ id, name, duration }))(program);
    const [formData, setFormData] = useState(needFormData);
    const [numEnroll, setNumEnroll] = useState([]);

    const handleSubmit = async () => {
        setIsModalOpen(true);
        try {
            // check if program has enrollments
            const responseNumEnroll = await fetch(`${process.env.REACT_APP_API_URL}/program/enrollments/${program.id}`,
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
        props.clearsearch();
    };

    //handler for submit Form action
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        //put request
        try {
            // Check if name already exists (this need to load availables names)
            const responseAllNames = await fetch(`${process.env.REACT_APP_API_URL}/program/allnames`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const jsonDataAllNames = await responseAllNames.json();
            const allNames = jsonDataAllNames.map((i) => Object.values(i)[0]);
            const allNamesMinusQuery = allNames.filter((id) => id !== program.name);
            console.log("checking ids");
            console.log(allNames);
            console.log(allNamesMinusQuery);
            console.log(program.name);

            //if name already exist throw error
            if (allNamesMinusQuery.includes(formData.name)) {
                throw new Error('name already exists');
            }

            //if enrollments already exists and duration is to be edited throw error
            if (numEnroll > 0 && formData.duration !== program.duration) {
                throw new Error('enrollments for this program already exists, cannot edit duration');
            }

            //copy row to be edited in db
            const responseCopy = await fetch(`${process.env.REACT_APP_API_URL}/program/copy/${program.id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );
            //finally update the row
            const response = await fetch(`${process.env.REACT_APP_API_URL}/program/edit/${program.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(formData)
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
            alert("Program record updated successfully!");
            closeModal();

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

    return (

        <div >
            <Button label="Edit" onClick={handleSubmit} />

            <Dialog
                visible={isModalOpen}
                onHide={closeModal}
                header="Editable information"
            >
                <ul>
                    <li>id: {program.id}</li>
                    <li>Name: {program.name}</li>
                    <li>Duration: {program.duration}</li>
                </ul>
                <h2>Number of enrollments: {numEnroll}</h2>



                <InputProgramForm
                    handleSubmit={handleSubmitForm}
                    formData={formData}
                    handleChange={handleChange}
                    title={"Edit Program"}
                />
                <Button onClick={closeModal} label="Close"/>
            </Dialog>

        </div>



    );
}
