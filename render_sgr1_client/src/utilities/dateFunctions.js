// dateFunctions.js

// Function to add k years to a given date
function addYearsToDate(date, k) {
    const newDate = new Date(date); // Create a copy of the date
    newDate.setFullYear(newDate.getFullYear() + k); // Add k years
    return newDate;
}

// Function to get the adjusted date based on the semester
function getAdjustedDate(date,type = "deliver") {
    const inputDate = new Date(date); // Create a copy of the date
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth(); // 0-based index (0 = January, 11 = December)
    
    let adjustedDate;
    if(type === "deliver"){
        if (month < 6) {
            // First semester (January to June)
            adjustedDate = new Date(year, 9, 30); // October 30th (Month 9 since it's 0-based)
        } else {
            // Second semester (July to December)
            adjustedDate = new Date(year + 1, 3, 30); // April 30th of the next year
        }
    } else if(type === "semester") {
        if (month < 6) {
            // First semester (January to June)
            adjustedDate = new Date(year, 0, 1); // 1 january
        } else {
            // Second semester (July to December)
            adjustedDate = new Date(year, 6, 1); // 1 july
        }
    }else if(type === "end") {
        if (month < 6) {
            // First semester (January to June)
            adjustedDate = new Date(year, 11, 31); // 31 dec
        } else {
            // Second semester (July to December)
            adjustedDate = new Date(year+1, 5, 30); // 30 june
        }
    } else {
        throw new Error(`Invalid type: ${type}. Expected 'deliver', 'semester' or 'end'.`);
    }
    return adjustedDate;
}

// Function to format a date as yyyy-mm-dd
function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addYearsToDateFormated(date, k) {
    const newDate = new Date(date); // Create a copy of the date
    const addedDate = addYearsToDate(newDate,k);
    const result = formatDateToYYYYMMDD(addedDate);
    return result;
}

function getAdjustedDateFormated(date, k,type = "deliver") {
    const newDate = new Date(date); // Create a copy of the date
    const adjustedDate = getAdjustedDate(newDate,type);
    const addedDate = addYearsToDate(adjustedDate,k-1);
    const result = formatDateToYYYYMMDD(addedDate);
    return result;
}

function calculateYearsPassed(startDate) {
    const start = new Date(startDate);
    const today = new Date();
  
    let yearsPassed = today.getFullYear() - start.getFullYear();
  
    // Adjust for cases where the current date hasn't yet reached the anniversary of the start date
    const startMonth = start.getMonth();
    const startDay = start.getDate();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
  
    if (todayMonth < startMonth || (todayMonth === startMonth && todayDay < startDay)) {
      yearsPassed--;
    }
  
    return yearsPassed;
  }

// Export all functions
module.exports = {
    addYearsToDate,
    getAdjustedDate,
    formatDateToYYYYMMDD,
    addYearsToDateFormated,
    getAdjustedDateFormated,
    calculateYearsPassed
};