// Helper function
const handleErrors = (res, errorStatusCode, errorMessage) => {
    console.error(`[ERREUR ${errorStatusCode || 500}] ${errorMessage || 'Internal Server Error'}`);
    return res.status(errorStatusCode || 500).json({ error: errorMessage || 'Internal Server Error'});
};

module.exports = { handleErrors }