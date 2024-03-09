// Helper function
const handleErrors = (res, errorStatusCode, errorMessage, fails=-1) => {
    console.error(`[ERREUR ${errorStatusCode || 500}] ${errorMessage || 'Internal Server Error'}`);

    // Don't send number of fails if it's negative
    if (fails < 0) {
        return res.status(errorStatusCode || 500).json({ error: errorMessage || 'Internal Server Error'});
    } else {
        return res.status(errorStatusCode || 500).json({ error: errorMessage || 'Internal Server Error', fails });
    }
};

module.exports = { handleErrors }