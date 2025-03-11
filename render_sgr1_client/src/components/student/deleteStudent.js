import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';


export default function DeleteStudent(props) {
    const student = props.data;
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/student/deactivate/${student.id_stu}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include" 
                }
            );
            if (!response.ok) {
                // If the response is not ok, throw an error
                const errorData = await response.json(); //parsing error from server side
            throw new Error(errorData.error || 'Failed to delete student.');
            }
            alert("Student record deleted successfully!");
            setIsModalOpen(false);
            props.setFormSubmitted(true);

        } catch (err) {
            console.error(err.message);
            alert(err.message);
        }
    };
  
    return (

        <div >

            <Button onClick={handleSubmit} label="Delete" severity="danger"/>
             
            <Dialog
                visible={isModalOpen}
                onHide={closeModal}
                header="Warning"
            >
                <h2>Student information</h2>
                <ul>
                    <li>id_stu: {student.id_stu}</li>
                    <li>id: {student.id}</li>
                    <li>Name: {student.name}</li>
                    <li>Last Name: {student.last_name}</li>
                    <li>email UR: {student.ur_mail}</li>
                    <li>email priv: {student.priv_mail}</li>
                    <li>phone: {student.phone}</li>
                </ul>
                <h2>Are you sure to delete this registry? </h2>
                <Button onClick={closeModal} label="Cancel" severity="secondary"/>
                <Button onClick={handleDelete} label="Delete"  severity="danger"/>
            </Dialog>
        </div>



    );
}