import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Card } from 'primereact/card';
import TablePrograms from "./tablePrograms";
import styles from "../styles.module.css";


export default function SedProgram() {
    const [progAtrrib, setProgAtrrib] = useState("");
    const [progQuery, setProgQuery] = useState("");
    const [programs, setPrograms] = useState([]);

    const getAllPrograms = async () => {
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
        getAllPrograms();
    }, []);

    const handleRadioChange = (event) => {
        setProgAtrrib(event.value);
    };

    const handleChangeQuery = (e) => {
        const { value } = e.target;
        setProgQuery(value);

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!progAtrrib) {  // Check if stuAtrrib is undefined, null, or an empty string
            alert("Please select an attribute before submitting the query.");
            return;  // Exit the function early if stuAtrrib is not defined or null
        }
        try {
            const params = new URLSearchParams({ attribute: progAtrrib, query: progQuery });
            const response = await fetch(`/program/search?${params}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const data = await response.json();
            setPrograms(data);
        } catch (err) {
            console.error(err.message);
        }

    };


    return (
        <div >
            <h1>Search program</h1>
            <Card className={styles.FormContainer}>
                <form onSubmit={handleSubmit} >

                    <fieldset className={styles.radioField}>
                        <legend>Select attribute to search:</legend>
                        <div >
                            <RadioButton
                                inputId="name"
                                name="progattr"
                                value="name"
                                onChange={handleRadioChange}
                                checked={progAtrrib === "name"}  // Control checked state
                                autoComplete="off"
                            />
                            <label htmlFor="name" className={styles.RadioFormLabel}>Name</label>
                        </div>
                        <div>
                            <RadioButton
                                inputId="duration"
                                name="progattr"
                                value="duration"
                                onChange={handleRadioChange}
                                checked={progAtrrib === "duration"}  // Control checked state
                                autoComplete="off"
                            />
                            <label htmlFor="duration" className={styles.RadioFormLabel}>Duration</label>
                        </div>
                    </fieldset>
                    <div className={styles.QueryContainer}>
                        <label htmlFor="programsearch" className={styles.FormLabelQuery}>Query</label>

                        <InputText
                            id="programsearch"
                            name="programsearch"
                            value={progQuery}
                            placeholder="Query"
                            onChange={handleChangeQuery}
                            required

                        />
                    </div>
                    <div className={styles.FormButtonContainer}>
                        <Button label="Search" type="submit" />
                    </div>

                </form >
            </Card>

            <div className={styles.TablePrograms}>
                <TablePrograms ED={true} programs={programs} clearsearch={() => setPrograms([])} />
            </div>

            <Button onClick={() => setPrograms([])} label="Clear Search" />

        </div >

    );
}