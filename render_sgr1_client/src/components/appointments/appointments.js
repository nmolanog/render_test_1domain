import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import styles from "../styles.module.css";
import TableAppointments from "./tableAppointment";
import { toZonedTime } from 'date-fns-tz';
const { utcDate } = require('../../utilities/dateFunctions');



export default function Appointments() {
    const { commit_id } = useParams()

    const emptyForm = {
        commit_id: commit_id,
        set_date: "",
        date: "",
        fullfiled: "",
        location: "",
        obs: "",
        end_commit: "no"
    };

    const emptyUnfullfiledForm = {
        fullfiled: "",
        location: "",
        obs: "",
        end_commit: "no"
    };

    const emptyDates = {
        set_date: "",
        date: ""
    };

    const fullfiledTypes = [
        { label: 'Yes', value: 'yes' },
        { label: 'Canceled by student', value: 'cancel_stu' },
        { label: 'Canceled by me', value: 'cancel_me' },
        { label: 'Pending', value: 'pending' }
    ];

    const [appointment, setAppointment] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalUnfullOpen, setIsModalUnfullOpen] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [maxApoDate, setMaxApoDate] = useState("");
    const [selectedDates, setSelectedDates] = useState(emptyDates);
    const [formData, setFormData] = useState(emptyForm);
    const [unfullfiledApointment, setUnfullfiledApointment] = useState("");
    const [unfulfilledApoIds, setUnfulfilledApoIds] = useState([]);
    const [unfulfilledForm, setUnfulfilledForm] = useState(emptyUnfullfiledForm);


    //get appointments
    useEffect(() => {
        const getAppointments = async () => {
            try {
                const responseAppointments = await fetch(`${process.env.REACT_APP_API_URL}/appointment/search4commit_id/${commit_id}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include"
                    });
                const jsonDataAppointments = await responseAppointments.json();
                setAppointment(jsonDataAppointments);

                if (!responseAppointments.ok) {
                    // If the response is not ok, throw an error
                    throw new Error('Failed to fetch appointments. Please try again.');
                }
            } catch (err) {
                console.error(err.message);
            }
        };
        getAppointments();
        setFormSubmitted(false);
    }, [commit_id, formSubmitted]);

    //min dates for appointments and unfullfiledApointments data
    useEffect(() => {

        const getAppointmentsDates = async () => {
            if (appointment.length > 0) {
                try {
                    const responseAppoDates = await fetch(`${process.env.REACT_APP_API_URL}/appointment/searchallappo/${appointment[0].enroll_id}`,
                        {
                            method: "GET",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include"
                        });
                    const jsonAppoDates = await responseAppoDates.json();

                    if (!responseAppoDates.ok) {
                        // If the response is not ok, throw an error
                        throw new Error('Failed to fetch all appointments dates. Please try again.');
                    }

                    if (Array.isArray(jsonAppoDates) && jsonAppoDates.length === 0) {
                        setMaxApoDate(appointment[0].start_date_semester);
                    } else if (Array.isArray(jsonAppoDates) && jsonAppoDates.length > 0) {
                        const maxapo = jsonAppoDates.reduce((max, current) => {
                            return new Date(current.apo_date) > new Date(max.apo_date) ? current : max;
                        }).apo_date;
                        setMaxApoDate(maxapo);
                    }

                } catch (err) {
                    console.error(err.message);
                }
            };
        };
        getAppointmentsDates();
        setUnfullfiledApointment(appointment.some(obj => obj.apo_fullfiled === "pending"));
        setUnfulfilledApoIds(
            appointment
                .filter(obj => obj.apo_fullfiled === "pending")
                .map(obj => obj.apo_id));


    }, [appointment]);

    const closeForm = () => {
        setIsFormOpen(false);
        setFormData(emptyForm);
        setSelectedDates(emptyDates);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsFormOpen(false);
        setFormData(emptyForm);
        setSelectedDates(emptyDates);
    };

    const closeModalUnfull = () => {
        setIsModalUnfullOpen(false);
        setIsFormOpen(false);
        setUnfulfilledForm(emptyUnfullfiledForm);
        setSelectedDates(emptyDates);
    };

    const updateForDelete = () => {
        setFormSubmitted(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'set_date') {
            setSelectedDates({ ...selectedDates, [name]: toZonedTime(value,'UTC'), date: toZonedTime(value,'UTC') });
            const formattedDate1 = utcDate(value);
            setFormData({ ...formData, [name]: formattedDate1, date: formattedDate1});

        } else if (name === 'date') {
            setSelectedDates({ ...selectedDates, [name]: value });
            const formattedDate2 = utcDate(value);
            setFormData({ ...formData, [name]: formattedDate2, });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        //setFormData({ ...formData, [name]: value });
    };

    const handleChangeUnfullfiled = (e) => {
        const { name, value } = e.target;
        setUnfulfilledForm({ ...unfulfilledForm, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        //post request
        try {

            const response = await fetch(`${process.env.REACT_APP_API_URL}/appointment/insert`,
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

            if (formData.end_commit === "yes") {
                const response2 = await fetch(`${process.env.REACT_APP_API_URL}/commitment/end/${commit_id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                        credentials: "include"
                    }
                );
                if (!response2.ok) {
                    // If the response is not ok, throw an error
                    throw new Error('Failed to edit commit.');
                }
            }

            if (formData.end_commit === "yes" && appointment[0].duration === appointment[0].commit_num) {
                const response3 = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/end/${appointment[0].enroll_id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                        credentials: "include"
                    }
                );
                if (!response3.ok) {
                    // If the response is not ok, throw an error
                    throw new Error('Failed to edit enrrolment.');
                }
            }

            // Show the modal on successful submission
            setIsModalOpen(true);
            setFormSubmitted(true); // Update the state to trigger useEffect

        } catch (err) {
            console.error(err.message);
            //alert('ID already exists!');
            alert(err.message);

        }
    };

    const handleSubmitUnfullfiled = async (e) => {
        e.preventDefault();
        //post request
        try {
            if (unfulfilledApoIds.length > 1) {
                // If the response is not ok, throw an error
                throw new Error('unfulfilledApoIds.length > 1');
            }

            const filteredAppointments = appointment.filter(item => item.apo_id === unfulfilledApoIds[0])[0];
            const tempFormData = {
                commit_id: commit_id,
                set_date: filteredAppointments.apo_set_date,
                date: filteredAppointments.apo_date,
                fullfiled: unfulfilledForm.fullfiled,
                location: unfulfilledForm.location,
                obs: unfulfilledForm.obs,
                end_commit: unfulfilledForm.end_commit
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/appointment/fullfile/${unfulfilledApoIds}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(unfulfilledForm),
                    credentials: "include"
                });
            if (!response.ok) {
                // If the response is not ok, throw an error
                throw new Error('Failed to update appointment.');
            }

            if (unfulfilledForm.end_commit === "yes") {
                const response2 = await fetch(`${process.env.REACT_APP_API_URL}/commitment/edit/${commit_id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(tempFormData),
                        credentials: "include"
                    }
                );
                if (!response2.ok) {
                    // If the response is not ok, throw an error
                    throw new Error('Failed to edit commit.');
                }
            }

            if (unfulfilledForm.end_commit === "yes" && appointment[0].duration === appointment[0].commit_num) {
                const response3 = await fetch(`${process.env.REACT_APP_API_URL}/enrollment/edit/${appointment[0].enroll_id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(tempFormData),
                        credentials: "include"
                    }
                );
                if (!response3.ok) {
                    // If the response is not ok, throw an error
                    throw new Error('Failed to edit enrrolment.');
                }
            }

            // Show the modal on successful submission
            setIsModalUnfullOpen(true);
            setFormSubmitted(true); // Update the state to trigger useEffect

        } catch (err) {
            console.error(err.message);
            alert(err.message);
        }

    };

    const renderSummary = () => {

        if (appointment.length !== 0) {
            return (
                <>
                    <div className={styles.CommitsHeader}>
                        <Card title="Student">
                            <ul>
                                <li>Student id: {appointment[0].student_id}</li>
                                <li>Name: {appointment[0].student_full_name}</li>
                                <li>UR mail: {appointment[0].student_urmail}</li>
                            </ul>
                        </Card>
                        <Card title="Enrollment">
                            <ul>
                                <li>Program: {appointment[0].program}</li>
                                <li>Duration: {appointment[0].duration}</li>
                                <li>Current year: {appointment[0].current_year}</li>
                                <li>Status: {appointment[0].enr_state}</li>
                                <li>Start date: {utcDate(appointment[0].start_date_semester)}</li>
                                <li>End date: {utcDate(appointment[0].end_date)}</li>
                            </ul>
                        </Card>
                        <Card title="Commit">
                            <ul>
                                <li>Id: {appointment[0].commit_id}</li>
                                <li>Number: {appointment[0].commit_num}</li>
                                <li>Due date: {utcDate(appointment[0].commit_due_date)}</li>
                                {maxApoDate ? (<li>min appointment date: {utcDate(maxApoDate)}</li>) :
                                    (<li>max date: loading...</li>)}
                            </ul>
                        </Card>
                        <Card title="Pending Appointment">
                            <ul>
                                <li>pendings: {unfullfiledApointment ? ("yes") : ("no")}</li>
                                <li>id: {unfulfilledApoIds.join(',')}</li>

                            </ul>
                        </Card>

                    </div>


                    <h2>Previous appointments</h2>
                    {appointment[0].apo_id ? (
                        <div className={styles.TableCommits}>
                            <TableAppointments appointment={appointment} updateForDelete={updateForDelete} />
                        </div>
                    ) :
                        (<p>No appointments found</p>)}

                </>
            );
        } else {
            return (<p> Loading enrollment data...</p>);
        }
    };

    const renderLocNotesUnfullfilled = () => {
        if (unfulfilledForm.fullfiled && unfulfilledForm.fullfiled === "yes") {
            return (
                <div className={styles.FormContainer}>
                    <Card>
                        <div>
                            <label htmlFor="location" className={styles.FormLabel}>Location:</label>

                            <InputText
                                value={unfulfilledForm.location}
                                id="location"
                                name="location"
                                placeholder="location"
                                onChange={handleChangeUnfullfiled}
                                required
                                autoComplete="off"

                            />
                        </div>

                        <div>
                            <label htmlFor="obs" className={styles.FormLabel}>Notes:</label>

                            <InputText
                                value={unfulfilledForm.obs}
                                id="obs"
                                name="obs"
                                placeholder="notes"
                                onChange={handleChangeUnfullfiled}
                                required
                                autoComplete="off"

                            />
                        </div>



                        <fieldset className={styles.radioField}>
                            <legend>End Commitment?</legend>

                            <div>

                                <RadioButton
                                    inputId="yes"
                                    name="end_commit"
                                    value="yes"
                                    onChange={handleChangeUnfullfiled}
                                    checked={unfulfilledForm.end_commit === 'yes'}
                                />

                                <label htmlFor="yes" className={styles.RadioFormLabel}>Yes</label>
                            </div>

                            <div>
                                <RadioButton
                                    inputId="no"
                                    name="end_commit"
                                    value="no"
                                    onChange={handleChangeUnfullfiled}
                                    checked={unfulfilledForm.end_commit === 'no'}
                                />
                                <label htmlFor="no" className={styles.RadioFormLabel}>No</label>
                            </div>

                        </fieldset>
                    </Card>

                </div>
            );
        }
        if (unfulfilledForm.fullfiled &&
            (unfulfilledForm.fullfiled === "cancel_stu" ||
                unfulfilledForm.fullfiled === "cancel_me")
        ) {
            return (
                <>
                    <label htmlFor="obs">Notes:</label>
                    <InputText
                        value={unfulfilledForm.obs}
                        id="obs"
                        name="obs"
                        placeholder="notes"
                        onChange={handleChangeUnfullfiled}
                        required
                        autoComplete="off"

                    />
                </>
            );
        }

    }

    const renderLocNotesCreatAppo = () => {
        if (formData.fullfiled && formData.fullfiled === "yes") {
            return (<>
                <div >
                    <label htmlFor="location" className={styles.FormLabel}>Location:</label>

                    <InputText
                        value={formData.location}
                        id="location"
                        name="location"
                        placeholder="location"
                        onChange={handleChange}
                        required
                        autoComplete="off"

                    />
                </div>

                <div >
                    <label htmlFor="obs" className={styles.FormLabel}>Notes:</label>

                    <InputText
                        value={formData.obs}
                        id="obs"
                        name="obs"
                        placeholder="notes"
                        onChange={handleChange}
                        required
                        autoComplete="off"

                    />
                </div>

                <fieldset className={styles.radioField}>
                    <legend>End Commit?</legend>

                    <div>

                        <RadioButton
                            inputId="yes"
                            name="end_commit"
                            value="yes"
                            onChange={handleChange}
                            checked={formData.end_commit === 'yes'}
                        />

                        <label htmlFor="yes" className={styles.RadioFormLabel}>Yes</label>
                    </div>

                    <div>
                        <RadioButton
                            inputId="no"
                            name="end_commit"
                            value="no"
                            onChange={handleChange}
                            checked={formData.end_commit === 'no'}
                        />
                        <label htmlFor="no" className={styles.RadioFormLabel}>No</label>
                    </div>

                </fieldset>

            </>);
        }
        if (formData.fullfiled &&
            (formData.fullfiled === "cancel_stu" || formData.fullfiled === "cancel_me")
        ) {
            return (
                <>
                    <label htmlFor="obs">Notes:</label>

                    <InputText
                        value={formData.obs}
                        id="obs"
                        name="obs"
                        placeholder="notes"
                        onChange={handleChange}
                        required
                        autoComplete="off"

                    />

                </>);
        }

    }

    const renderUIAppointments = () => {
        if (appointment.length !== 0 &&
            (appointment[0].commit_state === "delivered" || appointment[0].commit_state === "omited")) {
            return (<p>Commit delivered, cannot mannage more appointments</p>);
        }
        if (appointment.length !== 0 && appointment[0].enr_state === "Deferred") {
            return (<p>Enroll deferred, cannot mannage appointments</p>);
        }
        if (appointment.length !== 0 && unfullfiledApointment) {
            return (
                <div className={styles.AppoCreate}>
                    <div className={styles.FormContainerAppointment}>
                        <Card title="Unfullfiled Apointment">
                            <form onSubmit={handleSubmitUnfullfiled}>

                                <legend htmlFor="fullfiled" >Fullfiled?</legend>

                                <Dropdown
                                    id="fullfiled"
                                    name="fullfiled"
                                    value={unfulfilledForm.fullfiled}
                                    options={fullfiledTypes}
                                    onChange={handleChangeUnfullfiled}  // Handle Dropdown separately
                                    placeholder="Fullfiled?"
                                    className="w-full md:w-14rem"
                                    required
                                />

                                {renderLocNotesUnfullfilled()}
                                {!(unfulfilledForm.fullfiled === "" || unfulfilledForm.fullfiled === "pending") ?
                                    (
                                        <div className={styles.FormButtonContainer}>
                                            <Button type="submit" label="End Appointment" severity="success"/>
                                        </div>
                                    )
                                    : (<></>)}
                            </form>
                        </Card>
                    </div>

                    <Card title="Summary">
                        <ul>
                            {Object.entries(unfulfilledForm).map(([key, value]) => (
                                <li key={key}>
                                    <strong>{key}:</strong> {value.toString()}
                                </li>
                            ))}
                        </ul>

                    </Card>

                </div>
            );
        } else {
            return (
                <>
                    <h2>Create appointment</h2>


                    {!isFormOpen ? (<Button label="Create" onClick={() => setIsFormOpen(true)} />) : (<></>)}

                    {isFormOpen ? (
                        <div className={styles.AppoCreate}>
                            <div className={styles.FormContainerAppointment}>
                                <Card title="Appointment form">

                                    <form onSubmit={handleSubmit}>
                                        <div >
                                            <label htmlFor="set_date">Request date:</label>

                                            <Calendar
                                                inputId="set_date"
                                                name="set_date"
                                                value={selectedDates.set_date}
                                                onChange={handleChange}
                                                dateFormat="yy-mm-dd"
                                                showIcon
                                                minDate={toZonedTime(maxApoDate,'UTC')}
                                                maxDate={new Date('2030-12-31')}
                                                required
                                            />
                                        </div>

                                        <div >
                                            <label htmlFor="date">Appointment date:</label>

                                            <Calendar
                                                inputId="date"
                                                name="date"
                                                value={selectedDates.date}
                                                onChange={handleChange}
                                                dateFormat="yy-mm-dd"
                                                showIcon
                                                minDate={selectedDates.set_date}
                                                maxDate={new Date('2030-12-31')}
                                                required
                                            />
                                        </div>

                                        <div >
                                            <legend htmlFor="fullfiled" >Fullfiled?</legend>

                                            <Dropdown
                                                id="fullfiled"
                                                name="fullfiled"
                                                value={formData.fullfiled}
                                                options={fullfiledTypes}
                                                onChange={handleChange}  // Handle Dropdown separately
                                                placeholder="Fullfiled?"
                                                className="w-full md:w-14rem"
                                                required
                                            />
                                        </div>


                                        {renderLocNotesCreatAppo()}

                                        {formData.fullfiled !== "" ?
                                            (
                                                <>
                                                    <div className={styles.FormButtonContainer}>
                                                        <Button label="CANCEL" onClick={closeForm} severity="warning" />
                                                    </div>
                                                    <div className={styles.FormButtonContainer}>
                                                        <Button type="submit" label="Register Appointment" severity="success" />
                                                    </div>
                                                </>

                                            )
                                            : (<></>)}
                                    </form>


                                </Card>
                            </div>

                            <Card title="Summary" >
                                <ul>
                                    {Object.entries(formData).map(([key, value]) => (
                                        <li key={key}>
                                            <strong>{key}:</strong> {value.toString()}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    ) : (<p> </p>)}
                </>
            );
        }
    };

    return (

        <div >
            <h1>Appointments</h1>

            {renderSummary()}

            {renderUIAppointments()}

            <Dialog

                visible={isModalOpen}
                onHide={closeModal}
                header="Appointment Registered Successfully"
            >
                <ul>
                    {Object.entries(formData).map(([key, value]) => (
                        <li key={key}>
                            <strong>{key}:</strong> {value.toString()}
                        </li>
                    ))}
                </ul>
            </Dialog>

            <Dialog

                visible={isModalUnfullOpen}
                onHide={closeModalUnfull}
                header="Appointment updated Successfully"
            >
                <ul>
                    {Object.entries(unfulfilledForm).map(([key, value]) => (
                        <li key={key}>
                            <strong>{key}:</strong> {value.toString()}
                        </li>
                    ))}
                </ul>
            </Dialog>

            {
                appointment.length !== 0 && appointment[0].enroll_id ? (<Link to={`/commit/${appointment[0].enroll_id}`}>Back to commits</Link>) : (<p></p>)
            }
        </div>
    );
}
