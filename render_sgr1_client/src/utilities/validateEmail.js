export const validateUrEmail = (email) => {
    const pattern = /.+@urosario\.edu\.co/;
    return pattern.test(email);
};

export const validateEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
};