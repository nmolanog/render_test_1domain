import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { format } from 'date-fns';
import TableCommits from "./tableCommit";
import styles from "../styles.module.css";
const { getAdjustedDateFormated } = require('../../utilities/dateFunctions');



export default function Commit() {
    const { enroll_id } = useParams()
    const [isDefferOpen, setIsDefferOpen] = useState(false);
    const [isReactivateOpen, setIsReactivateOpen] = useState(false);
    const [isDefferSent, setIsDefferSent] = useState(false);
    const [commitment, setCommitment] = useState([]);
    //const [updatedCommits, setUpdatedCommits] = useState([]);
    const [enrollment, setEnrollment] = useState({
        enroll_id: "",
        student_id: "",
        student_full_name: "",
        student_urmail: "",
        program: "",
        duration: "",
        current_year: "",
        state: "",
        active: "",
    });
    const [defferringForm, setDefferringForm] = useState({
        deffering_date: "",
        return_date: ""
    });

    const [defferrData, setDefferrData] = useState({});

    const closeDefferDialog = () => {
        setIsDefferOpen(false);
    };

    const closeReactivateDialog = () => {
        setIsReactivateOpen(false);
    };

    useEffect(() => {
        const getData = async () => {
            try {
                const responseCommits = await fetch(`${process.env.REACT_APP_API_URL}/commitment/search4enroll_id/${enroll_id}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include"
                    });
                const jsonDataCommits = await responseCommits.json();
                setCommitment(jsonDataCommits);

                if (!responseCommits.ok) {
                    // If the response is not ok, throw an error
                    throw new Error('Failed to fetch commits. Please try again.');
                }
                const responseEnrollment = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/search/${enroll_id}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include"
                    });
                const jsonDataEnrollment = await responseEnrollment.json();

                setEnrollment(jsonDataEnrollment);

                if (!responseEnrollment.ok) {
                    // If the response is not ok, throw an error
                    throw new Error('Failed to fetch enrollment. Please try again.');
                }

            } catch (err) {
                console.error(err.message);
            }
        };
        getData();
        setIsDefferSent(false);
    }, [enroll_id, isDefferSent]);

    useEffect(() => {
        const getDeferrData = async () => {
            if (enrollment.state && enrollment.state === 'Deferred') {
                try {
                    const responseDeferrData = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/searchdeferr/${enroll_id}`,
                        {
                            method: "GET",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include"
                        });
                    const jsonDeferrData = await responseDeferrData.json();
                    setDefferrData(jsonDeferrData);

                } catch (err) {
                    console.error(err.message);
                }
            };
        };
        getDeferrData();
    }, [enrollment.state, enroll_id]);


    const handleSubmitDefferr = async (e) => {
        e.preventDefault();
        try {
            const deferredDateSemester = getAdjustedDateFormated(defferringForm.deffering_date, 1, "semester");
            const payload = {
                deffering_date: defferringForm.deffering_date,
                deffering_date_semester: deferredDateSemester
            };
            const response = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/defer/${enroll_id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    credentials: "include"
                });
            if (!response.ok) {
                // If the response is not ok, throw an error
                throw new Error('Failed to deferr enroll.');
            } else {
                alert("Enrollment deferred sucessfully!");
            }
            closeDefferDialog();
            setIsDefferSent(true);
        } catch (err) {
            console.error(err.message);
            alert(err.message);
        }
    };

    const handleSubmitReactivate = async (e) => {
        e.preventDefault();
        //getting commits which needs updates
        const filteredCommitment = commitment.filter(item => {
            const dueDate = new Date(item.due_date); // Convert string to Date object
            const returnDate = new Date(defferrData.deffering_date); // Convert return_date to Date object

            return dueDate > returnDate; // Compare the two dates
        });

        //getting ids of the commits to be updated
        const updateArray = filteredCommitment.map((e, i) => {
            const returnDate = new Date(defferringForm.return_date);
            return (
                {
                    id: e.id,
                    due_date: getAdjustedDateFormated(returnDate, i + 1)
                }
            );

        });
        //console.log(defferringForm.return_date);
        //console.log(updateArray);
        try {
            const ReactivateDateSemester = getAdjustedDateFormated(defferringForm.return_date, 1, "semester");
            const payload = {
                return_date: ReactivateDateSemester,
                enroll_id: enroll_id
            };
            const response = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/reactivate/${defferrData.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    credentials: "include"
                });
            if (!response.ok) {
                // If the response is not ok, throw an error
                throw new Error('Failed to reactivate enroll.');
            } else {
                alert("Enrollment deferred sucessfully!");
            };

            const response2 = await fetch(`${process.env.REACT_APP_API_URL}/commitment/update_duedate`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateArray),
                    credentials: "include"
                });
            if (!response2.ok) {
                // If the response is not ok, throw an error
                throw new Error('Failed to update due_dates in commits.');
            } else {
                alert("due_dates in commits updated sucessfully!");
            };

            closeReactivateDialog();
            setIsDefferSent(true);
        } catch (err) {
            console.error(err.message);
            alert(err.message);
        }




    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDefferringForm({ ...defferringForm, [name]: value });
    };

    const renderDefferOption = () => {
        if (enrollment.state && enrollment.state === "active") {
            return (
                <div >
                    <h2>Defer enroll</h2>
                    <Button label="Deffer" severity="warning" onClick={() => setIsDefferOpen(true)} />
                </div>

            );
        };
        if (enrollment.state && enrollment.state === "Deferred") {
            return (
                <div>
                    <h2>Reactivate enroll</h2>
                    <Button label="Reactivate" severity="warning" onClick={() => setIsReactivateOpen(true)} />
                </div>

            );
        };
    };

    return (

        <div  >
            <div className={styles.CommitsHeader}>
                <div>
                    <h1>Commits:</h1>
                    <h2>Summary</h2>
                </div>
                {renderDefferOption()}
            </div>

            <div className={styles.CommitSummaryContainer}>
                <Card title="Student">
                    <ul>
                        <li>id: {enrollment.student_id}</li>
                        <li>Name: {enrollment.student_full_name}</li>
                        <li>UR mail: {enrollment.student_urmail}</li>
                    </ul>
                </Card>
                <Card title="Enrollment">
                    <ul>
                        <li>id: {enroll_id}</li>
                        <li>Program: {enrollment.program}</li>
                        <li>Duration: {enrollment.duration}</li>
                        <li>Current year: {enrollment.current_year}</li>
                        { // beware dates from db are imported as string in the front end
                            enrollment.start_date_semester ?
                                (<li>Start date (semester): {format(new Date(enrollment.start_date_semester), 'MM/dd/yyyy')}</li>) :
                                (<li> Loading enrollment data...</li>)}

                        {enrollment.end_date ?
                            (<li>End date (semester): {format(new Date(enrollment.end_date), 'MM/dd/yyyy')}</li>) :
                            (<li> Loading enrollment data...</li>)}
                        <li>State: {enrollment.state}</li>
                    </ul>
                </Card>


                {enrollment.state && enrollment.state === 'Deferred' ? (
                    <Card title="Deffered">
                        {/*
                            <ul>
                                {Object.entries(defferrData).map(([key, value]) => (
                                    <li key={key}>
                                        {key} - {value}
                                    </li>
                                ))}
                            </ul>
                       */}
                       
                        <ul>
                            <li>Deffering date: {defferrData.deffering_date_semester && defferrData.deffering_date_semester!=="" ? 
                            format(new Date(defferrData.deffering_date_semester), 'MM/dd/yyyy'):(<p>Loading...</p>)} </li>
                            <li>Deffer state: {defferrData.deffer_state} </li>
                        </ul>
                       
                        

                    </Card>
                ) : (<></>)}
            </div>

            <div className={styles.TableCommits}>
                <TableCommits omitSent={() => setIsDefferSent(true)} commits={commitment} />
            </div>
            <div className={styles.FormButtonContainer}>
                <Link to={`/sedenrollment`}>Back to search</Link>
            </div>
            <Dialog
                visible={isDefferOpen}
                onHide={closeDefferDialog}
                header="Defferring Enrollment"
            >
                <Card title="" className="max-w-md mx-auto p-4">
                    <form onSubmit={handleSubmitDefferr}>
                        <label htmlFor="deffering_date">Defferring Date:</label>
                        <Calendar
                            inputId="deffering_date"
                            name="deffering_date"
                            value={defferringForm.deffering_date}
                            onChange={handleChange}
                            dateFormat="yy-mm-dd"
                            showIcon
                            minDate={new Date(enrollment.start_date_semester)}
                            maxDate={new Date(enrollment.end_date)}
                            required
                        />
                        {defferringForm.deffering_date !== "" ?
                            (<Button type="submit" label="Defer Enroll" />)
                            : (<></>)}
                    </form>
                </Card>
            </Dialog>

            <Dialog
                visible={isReactivateOpen}
                onHide={closeReactivateDialog}
                header="Reactivate Enrollment"
            >
                <Card title="" className="max-w-md mx-auto p-4">
                    <form onSubmit={handleSubmitReactivate}>
                        <label htmlFor="return_date">Reactivate Date:</label>
                        <Calendar
                            inputId="return_date"
                            name="return_date"
                            value={defferringForm.return_date}
                            onChange={handleChange}
                            dateFormat="yy-mm-dd"
                            showIcon
                            minDate={new Date(defferrData.deffering_date_semester)}
                            required
                        />
                        {defferringForm.return_date !== "" ?
                            (<Button type="submit" label="Reactivate Enroll" />)
                            : (<></>)}
                    </form>
                </Card>
            </Dialog>
        </div>
    );
}

