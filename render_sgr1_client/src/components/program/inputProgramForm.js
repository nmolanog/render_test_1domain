import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import styles from "../styles.module.css";

export default function InputProgramForm(props) {

  return (
    <Card title={props.title} >
      <form onSubmit={props.handleSubmit} >

        <div >
          <label htmlFor="name" className={styles.FormLabel}>Program Name:</label>
          <InputText
            value={props.formData.name}
            id="name"
            name="name"
            placeholder="Program's name"
            onChange={props.handleChange}
            required
            autoComplete="off"
            className={styles.FormField}
          />
        </div>

        <div >
          <label htmlFor="duration" className={styles.FormLabel}>Duration (years):</label>
          <InputNumber
            value={props.formData.duration}
            inputId="duration"
            name="duration"
            placeholder="Duration (years)"
            showButtons
            min={0}
            max={6}
            mode="decimal"
            minFractionDigits={0}
            maxFractionDigits={0}
            onChange={(e) => props.handleChange({ target: { name: 'duration', value: e.value } })}  // Custom event object
            required
            autoComplete="off"
          />
        </div>

        <div className={styles.FormButtonContainer}>
          <Button label="Register" type="submit" />
        </div>
      </form>
    </Card>
  );
}