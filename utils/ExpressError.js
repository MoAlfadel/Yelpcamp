module.exports = class ExoressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
};
