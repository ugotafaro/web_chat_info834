// Helper function
const handleErrors = (res, status, error) => {
    error = error || 'Internal Server Error';
    status = status || 500;

    console.error(`[ERREUR ${status}] ${error}`);
    return res.status(status).json({error});
};

const handleLoginErrors = (res, status, error, fails, failSpan, maxAttempts) => {
    status = status || 500;
    error = error || 'Internal Server Error';

    console.error(`[ERREUR ${status}] ${error}`);
    return res.status(status).json({ error, fails, failSpan, maxAttempts});
}

module.exports = { handleErrors, handleLoginErrors }