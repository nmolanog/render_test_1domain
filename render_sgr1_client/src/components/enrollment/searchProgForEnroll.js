import React, { useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';

const SearchProgForEnroll = ({ value, onSelect }) => {
    const [filteredPrograms, setFilteredPrograms] = useState([]);

    // Function to load options asynchronously
    const loadOptions = async (inputValue) => {
        if (!inputValue) {
            setFilteredPrograms([{ id: "", duration: "" }]);
            return;
        }

        try {
            // Construct the query string using URLSearchParams
            const params = new URLSearchParams({ query: inputValue });

            // Fetch data using fetch API
            const response = await fetch(`/program/search4enroll?${params}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const data = await response.json();

            // Map the response data to match the format required by AutoComplete
            const programs = data.map((program) => ({
                label: `${program.name} (duration: ${program.duration})`,
                value: { id: program.id, duration: program.duration }
            }));

            setFilteredPrograms(programs);
        } catch (error) {
            console.error('Error fetching data:', error);
            setFilteredPrograms([]);
        }
    };

    // Handle selection
    const handleChange = (e) => {
        onSelect(e.value);
    };

    return (
        <AutoComplete
            id="program"
            name="program"
            value={value} // Controlled value prop
            suggestions={filteredPrograms}
            completeMethod={(e) => loadOptions(e.query)}
            field="label"
            onChange={handleChange}
            placeholder="Search for a program..."
        />
    );
};

export default SearchProgForEnroll;
