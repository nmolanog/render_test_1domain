const { getAdjustedDateFormated } = require('./dateFunctions');

function createCommitmentData(num, date) {
    const newDate = new Date(date);
    const result = {
        commit_num: num,
        due_date: getAdjustedDateFormated(newDate,num)
    };
    return result;
  }

  function createCommitmentArray(duration, date) {
    return Array.from({ length: duration }, (_, index) => createCommitmentData(index + 1, date));
  }

  module.exports = {
    createCommitmentData, 
    createCommitmentArray
};

