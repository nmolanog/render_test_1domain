import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import styles from "../styles.module.css";

export default function InputStudentForm(props) {

  return (
    <Card title={props.title} >
      <form onSubmit={props.handleSubmit} >
        <div >
          <label htmlFor="id" className={styles.FormLabel}>ID:</label>
          <InputText
            value={props.formData.id}
            id="id"
            name="id"
            placeholder="Student's ID"
            onChange={props.handleChange}
            required
            autoComplete="off"
            className={styles.FormField}
          />
        </div>

        <div >
          <label htmlFor="name" className={styles.FormLabel}>Name:</label>
          <InputText
            value={props.formData.name}
            id="name"
            name="name"
            placeholder="Student's Name"
            onChange={props.handleChange}
            required
            autoComplete="off"
            className={styles.FormField}
          />
        </div>

        <div >
          <label htmlFor="last_name" className={styles.FormLabel}>Last Name:</label>
          <InputText
            value={props.formData.last_name}
            id="last_name"
            name="last_name"
            placeholder="Student's Last Name"
            onChange={props.handleChange}
            required
            autoComplete="off"
            className={styles.FormField}
          />
        </div>

        <div >
          <label htmlFor="ur_mail" className={styles.FormLabel}>UR Email:</label>
          <InputText
            value={props.formData.ur_mail}
            id="ur_mail"
            name="ur_mail"
            keyfilter="email"
            placeholder="UR email"
            onChange={props.handleChange}
            required
            autoComplete="off"
            className={styles.FormField}
          />
        </div>

        <div >
          <label htmlFor="priv_mail" className={styles.FormLabel}>Private Email:</label>
          <InputText
            value={props.formData.priv_mail}
            id="priv_mail"
            name="priv_mail"
            keyfilter="email"
            placeholder="Private email"
            onChange={props.handleChange}
            className={styles.FormField}
            autoComplete="off"
          />
        </div>

        <div >
          <label htmlFor="phone" className={styles.FormLabel}>Phone:</label>
          <InputText
            value={props.formData.phone}
            id="phone"
            name="phone"
            placeholder="Phone"
            onChange={props.handleChange}
            required
            autoComplete="off"
            className={styles.FormField}
          />
        </div>

        <div className={styles.FormButtonContainer}>
          <Button label="Register" type="submit" />
        </div>
      </form>
    </Card>
  );
}