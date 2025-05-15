import { useState, useRef, useContext } from 'react';
import './AccountPicture.css';
import { uploadProfileImage } from '../../services/user.service';
import AppContext from '../../providers/AppContext';

const AccountPicture = ({ hideImgPicker, setAccPic }) => {

    const { userData } = useContext(AppContext);

    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    const fileInputRef = useRef();

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleClick = () => fileInputRef.current.click();

    const handleRemove = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        fileInputRef.current.value = null;
    };

    const handleUpload = async () => {
        if (selectedFile) {
            setUploading(true);
            try {
                const url = await uploadProfileImage(userData.handle, selectedFile);
                await new Promise((resolve) => setTimeout(resolve, 5000));
                setMessage('Profile picture uploaded successfuly.');
                setAccPic(url);
            } catch (e) {
                setMessage(e.message);
            }
            setUploading(false);
        }
    };

    return (
        <div id="acc-pic-backdrop" onClick={() => hideImgPicker(false)}>
            <div onClick={(e) => e.stopPropagation()}>
                <div className={`uploader-container ${uploading && 'rotating-border-loading'}`}>
                    <div
                        className="drop-area"
                        onClick={handleClick}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => handleFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                        {!previewUrl ? (
                            <p>Click or drag an image here</p>
                        ) : (
                            <div className="preview-container">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="preview-image"
                                />
                            </div>
                        )}
                    </div>
                    {previewUrl && (
                        <>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile}
                                className="upload-button"
                            >
                                Upload
                            </button>
                            <button
                                onClick={handleRemove}
                                className="remove-button"
                            >
                                Remove
                            </button>
                        </>
                    )}
                </div>
                {message && <p className='acc-pic-message'>{message}</p>}
            </div>
        </div>
    );
};

export default AccountPicture;
