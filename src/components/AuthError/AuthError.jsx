function AuthError({ setError, message }) {
    return (
        <div id="auth-error">
            <div id="message">
                <p>{message}</p>
            </div>
            <div id="auth-error-close">
                <button onClick={() => setError(null)}>X</button>
            </div>
        </div>
    );
};

export default AuthError;
