import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import TableEnrollments from "./tableEnrollment";
import styles from "../styles.module.css";

export default function SedEnrollment() {
    const [enrollAtrrib, setEnrollAtrrib] = useState("");
    const [enrollQuery, setEnrollQuery] = useState("");
    const [enrollments, setEnrollments] = useState([]);

    const getAllEnrollments = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/all`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const jsonData = await response.json();
            setEnrollments(jsonData);

        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getAllEnrollments();
    }, []);

    const attrSearchTypes = [
        { label: "Enroll ID", value: "enroll_id" },
        { label: "Student ID", value: "student_id" },
        { label: "Student full name", value: "student_full_name" },
        { label: "UR Email", value: "student_urmail" },
        { label: "Program", value: "program" },
        { label: "Program duration", value: "duration" },
        { label: "Enrollment start date (semester)", value: "start_date_semester" },
        { label: "Enrollment end date", value: "end_date" },
        { label: "Current year", value: "current_year" },
        { label: "Enrollment status", value: "state" }
    ];

    const handleDropdownChange = (event) => {
        setEnrollAtrrib(event.target.value);
    };

    const handleChangeQuery = (e) => {
        const { value } = e.target;
        setEnrollQuery(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!enrollAtrrib) {  // Check if enrollAtrrib is undefined, null, or an empty string
            alert("Please select an attribute before submitting the query.");
            return;  // Exit the function early if enrollAtrrib is not defined or null
        }
        try {
            const params = new URLSearchParams({ attribute: enrollAtrrib, query: enrollQuery });
            const response = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/search?${params}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const data = await response.json();
            setEnrollments(data);
        } catch (err) {
            console.error(err.message);
        }

    };


    return (
        <div >
            <h1>Search enrollment</h1>
            <Card>
            <form onSubmit={handleSubmit} className={styles.FormContainer}>
                <label htmlFor="enrollattr" className={styles.FormLabel}>Select attribute to search: </label>
                <Dropdown
                    inputId="enrollattr"
                    name="enrollattr"
                    value={enrollAtrrib}
                    options={attrSearchTypes}
                    onChange={handleDropdownChange}  // Handle Dropdown separately
                    placeholder="Select attribute"
                />

                <label htmlFor="enrollmentsearch" className={styles.FormLabel}>Query: </label>
                <InputText
                    id="enrollmentsearch"
                    name="enrollmentsearch"
                    value={enrollQuery}
                    placeholder="Query"
                    onChange={handleChangeQuery}
                    required
                    className={styles.FormField}

                />
                <div className={styles.FormButtonContainer}>
                    <Button label="Search" type="submit" />
                </div>
            </form>
            </Card>
            <div className={styles.TableEnrolls}>
                <TableEnrollments ED={true} enrollments={enrollments} clearsearch={() => setEnrollments([])} />
            </div>
            <button type="button"
                onClick={() => setEnrollments([])}>
                Clear Search</button>
        </div>
    );
}