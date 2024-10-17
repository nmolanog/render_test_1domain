import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from 'primereact/button';

export default function CommitEnrollment(props) {
    const navigate = useNavigate();
    return (
        <div >
            <Button label="Commits" onClick={() => navigate(`/commit/${props.data.enroll_id}`)}/>
        </div>
    );
}
