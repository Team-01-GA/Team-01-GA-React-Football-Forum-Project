function AuthError({ message }) {
    return (
        <div id="auth-error" className="glassmorphic-bg">
            <div id="message">
                <p>{message}</p>
            </div>
        </div>
    );
};

export default AuthError;
