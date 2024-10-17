import React, { useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';

const SearchStudForEnroll = ({ value, onSelect }) => {
    const [filteredStudents, setFilteredStudents] = useState([]);

    // Function to load options asynchronously
    const loadOptions = async (inputValue) => {
        if (!inputValue) {
            setFilteredStudents([]);
            return;
        }

        try {
            // Construct the query string using URLSearchParams
            const params = new URLSearchParams({ query: inputValue });

            // Fetch data using fetch API
            const response = await fetch(`/student/search4enroll?${params}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
            const data = await response.json();

            // Map the response data to match the format required by AutoComplete
            const students = data.map((student) => ({
                label: `${student.id} ${student.name} ${student.last_name} (${student.ur_mail})`,
                value: student.id_stu
            }));

            setFilteredStudents(students);
        } catch (error) {
            console.error('Error fetching data:', error);
            setFilteredStudents([]);
        }
    };

    // Handle selection
    const handleChange = (e) => {
        onSelect(e.value);
    };

    return (
        <AutoComplete
            id="student"
            name="student"
            value={value} // Controlled value prop
            suggestions={filteredStudents}
            completeMethod={(e) => loadOptions(e.query)}
            field="label"
            onChange={handleChange}
            placeholder="Search for a student..."
        />
    );
};

export default SearchStudForEnroll;
