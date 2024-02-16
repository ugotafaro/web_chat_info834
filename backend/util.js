// Helper function
const handleErrors = (res, errorStatusCode, errorMessage) => {
    console.error(`[ERREUR ${errorStatusCode ?? 500}] ${errorMessage}`);
    return res.status(errorStatusCode ?? 500).json(errorMessage);
};

module.exports = { handleErrors }