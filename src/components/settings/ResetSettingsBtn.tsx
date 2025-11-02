const ResetSettingsBtn = () => {
    // clear all the local storage settings to default
    const handleReset = () => {
        localStorage.clear();
        location.reload();
    };
    return (
        <button id="reset-btn" className="btn large-btn" onClick={handleReset}>Reset Settings</button>
    );
}

export default ResetSettingsBtn;