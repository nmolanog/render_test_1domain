import React, { useState } from 'react';
import SearchStudForEnroll from './searchStudForEnroll';
import SearchProgForEnroll from './searchProgForEnroll';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import styles from "../styles.module.css";
const { getAdjustedDateFormated } = require('../../utilities/dateFunctions');
const { createCommitmentArray } = require('../../utilities/createCommitment');



export default function InputEnrollments() {
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedProgram, setSelectedProgram] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idCommit, setidCommit] = useState(false); // maybe this can be droped after testing
    const [modalKey, setModalKey] = useState(0);
    const [formData, setFormData] = useState({
        student_id: "",
        program_id: "",
        start_date: "",
        start_date_semester: "",
        end_date: ""
    });

    const [commitment, setCommitment] = useState([]);

    const handleSelectStu = (student) => {
        setSelectedStudent(student);
        setFormData({ ...formData, student_id: student.value });
    };

    const handleSelectProg = (program) => {
        setSelectedProgram(program);
        if (program && program.value) {
            setFormData({ ...formData, program_id: program.value.id });
            if (selectedDate) {
                setCommitment(createCommitmentArray(program.value.duration, selectedDate.toISOString().split('T')[0]));
            }
        }
    };

    const handleSelectDate = (e) => {
        const date = e.value;
        setSelectedDate(date);
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            setFormData(prevFormData => ({
                ...prevFormData,
                start_date: formattedDate,
                start_date_semester: getAdjustedDateFormated(formattedDate, 1, "semester"),
                end_date: selectedProgram && selectedProgram.value
                    ? getAdjustedDateFormated(formattedDate, selectedProgram.value.duration, "end")
                    : prevFormData.end_date
            }));
            if (selectedProgram && selectedProgram.value) {
                setCommitment(createCommitmentArray(selectedProgram.value.duration, formattedDate));
            }
        }
    };

    //handler for submit action
    const handleSubmit = async (e) => {
        e.preventDefault();

        //post request
        try {

            const response = await fetch("/enrollment/insert",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                    credentials: "include"
                }
            );
            if (!response.ok) {
                // If the response is not ok, throw an error
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit the form. Please try again.');
            }

            // Parse the JSON response to get the returned ID
            const data = await response.json();
            setidCommit(data.id); // Access the ID from the response    Tried to use this in the second fetch but did not work       
            const tempIdCommit = data.id;
            // Show the modal on successful submission
            setIsModalOpen(true);
            //commit

            const response2 = await fetch(`/commitment/insert/${tempIdCommit}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commitment),
                credentials: "include"
            });
            if (response2.ok) {
                const result = await response2.text(); // or response.json() if server sends JSON
                console.log('Commitments inserted successfully:', result);
            } else {
                console.error('Failed to insert commitments:', response2.statusText);
            }

        } catch (err) {
            console.error(err.message);
            //alert('ID already exists!');
            alert(err.message);
            setFormData({
                student_id: "",
                program_id: "",
                start_date: "",
                start_date_semester: "",
                end_date: ""
            });
            setSelectedStudent("");
            setSelectedProgram([]);
            setSelectedDate(null);
        }

    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalKey(modalKey + 1); // Change the key to force a re-render
        setFormData({
            student_id: "",
            program_id: "",
            start_date: "",
            start_date_semester: "",
            end_date: ""
        });
        setSelectedStudent("");
        setSelectedProgram("");
        setSelectedDate("");
        setCommitment([]);
    };

    return (

        <div>
            <div className={styles.InputEnrollContainer}>
                <div className={styles.FormContainerEnroll}>
                    <Card title="Enroll">
                    <form onSubmit={handleSubmit}>
                        <h2>Select a Student</h2>
                        <SearchStudForEnroll key={modalKey} value={selectedStudent} onSelect={handleSelectStu} />

                        <h2>Select a Program</h2>
                        <SearchProgForEnroll value={selectedProgram} onSelect={handleSelectProg} />

                        {selectedProgram && formData.program_id !== "" ? (
                            <div>
                                <h2>Select start date</h2>
                                <Calendar
                                    inputId="start_date"
                                    value={selectedDate}
                                    onChange={handleSelectDate}
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                    minDate={new Date('2019-01-01')}
                                    maxDate={new Date('2030-12-31')}
                                />

                            </div>
                        ) : (<></>)}


                        <div className={styles.FormButtonContainer}>
                            <Button type="submit" label="Enroll" />
                        </div>
                    </form >
                    </Card>
                   
                </div >
                <Card title="Summary">
                    <Card title="Enrollment">
                        <ul>
                            <li>DB student id: {formData.student_id}</li>
                            <li>Student: {selectedStudent.label}</li>
                            <li>DB program id: {formData.program_id}</li>
                            <li>Program: {selectedProgram.label}</li>
                            <li>Start date: {formData.start_date}, (semester {formData.start_date_semester}) </li>
                            <li>End date: {formData.end_date}</li>
                        </ul>
                    </Card>
                    <Card title="Commitments">
                        <ul>
                            {commitment.map((commit) => (
                                <li key={commit.commit_num}>
                                    <div># {commit.commit_num} - Due date: {commit.due_date}</div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Card>


            </div>

            <Dialog

                visible={isModalOpen}
                onHide={closeModal}
                header="Enrollment Registered Successfully"
            >
                <h2>Enrollment Registered Successfully</h2>
                <ul>
                    <li>id enrollment: {idCommit}</li>
                    <li>student_id: {formData.student_id}</li>
                    <li>program_id: {formData.program_id}</li>
                    <li>start_date: {formData.start_date}</li>
                    <li>start_date_semester: {formData.start_date_semester}</li>
                    <li>end_date: {formData.end_date}</li>
                </ul>
                <h2>Commitnment</h2>
                <ul>
                    {commitment.map((commit) => (
                        <li key={commit.commit_num}>
                            <div>num: {commit.commit_num}</div>
                            <div>due_date: {commit.due_date}</div>
                        </li>
                    ))}
                </ul>
                <Button onClick={closeModal} label="Close" />
            </Dialog>
        </div >
    );
}
