import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import TableStudents from "./tableStudents";
import styles from "../styles.module.css";


export default function SedStudent() {
    const [stuAtrrib, setStuAtrrib] = useState("");
    const [stuQuery, setStuQuery] = useState("");
    const [students, setStudents] = useState([]);

    const getAllstudents = async () => {
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
        getAllstudents();
    }, []);

    const attrSearchTypes = [
        { label: "ID", value: "id" },
        { label: "Name", value: "name" },
        { label: "Last Name", value: "last_name" },
        { label: "UR Email", value: "ur_mail" },
        { label: "Private Email", value: "priv_mail" },
        { label: "Phone", value: "phone" },
    ];

    const handleDropdownChange = (event) => {
        setStuAtrrib(event.value);
    };

    const handleChangeQuery = (e) => {
        const { value } = e.target;
        setStuQuery(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stuAtrrib) {  // Check if stuAtrrib is undefined, null, or an empty string
            alert("Please select an attribute before submitting the query.");
            return;  // Exit the function early if stuAtrrib is not defined or null
        }
        try {
            const params = new URLSearchParams({ attribute: stuAtrrib, query: stuQuery });
            const response = await fetch(`${process.env.REACT_APP_API_URL}/student/search?${params}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );
            const data = await response.json();
            setStudents(data);
        } catch (err) {
            console.error(err.message);
        }

    };

    return (
        <div >
            <h1>Search student</h1>
            <Card>
                <form onSubmit={handleSubmit} className={styles.FormContainer}>
                    <div >
                        <label htmlFor="studattr" className={styles.FormLabel}>Select attribute to search: </label>

                        <Dropdown
                            inputId="studattr"
                            name="studattr"
                            value={stuAtrrib}
                            options={attrSearchTypes}
                            onChange={handleDropdownChange}  // Handle Dropdown separately
                            placeholder="Select attribute"
                        />

                    </div>
                    <div >
                        <label htmlFor="studentsearch" className={styles.FormLabel}>Query: </label>

                        <InputText
                            id="studentsearch"
                            name="studentsearch"
                            value={stuQuery}
                            placeholder="Query"
                            onChange={handleChangeQuery}
                            required
                            className={styles.FormField}
                        />
                    </div>
                    <div className={styles.FormButtonContainer}>
                        <Button label="Search" type="submit" />
                    </div>
                </form>
            </Card>
            <div className={styles.TableStudents}>
                <TableStudents ED={true} students={students} clearsearch={() => setStudents([])} />
            </div>
            <div className={styles.FormButtonContainer}>
                <Button onClick={() => setStudents([])} label="Clear Search" />
            </div>
        </div>
    );
}