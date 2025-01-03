import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';


function DisplayMedia({ url, className = "" }) {
    const [mediaType, setMediaType] = useState(null);

    DisplayMedia.propTypes = {
        className: PropTypes.string,
        url: PropTypes.string.isRequired,
    };

    useEffect(() => {
        const fetchMediaType = async () => {
            try {
                if (url.startsWith('blob:')) {
                    // Handle Blob URL
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const contentType = blob.type;

                    if (contentType.includes('image')) {
                        setMediaType('image');
                    } else if (contentType === 'application/pdf') {
                        setMediaType('pdf');
                    } else {
                        setMediaType('unsupported');
                    }
                } else {
                    // Handle regular URL
                    const response = await fetch(url, { method: 'HEAD' });
                    const contentType = response.headers.get('Content-Type');

                    if (contentType.includes('image')) {
                        setMediaType('image');
                    } else if (contentType === 'application/pdf') {
                        setMediaType('pdf');
                    } else {
                        setMediaType('unsupported');
                    }
                }
            } catch (error) {
                console.error('Error fetching media type:', error);
                setMediaType('unsupported');
            }
        };

        fetchMediaType();
    }, [url]);

    return (
        <div className={className}>
            {mediaType === 'image' && <img src={url} alt="media" style={{ maxWidth: '500px', maxHeight: '600px' }} />}
            {mediaType === 'pdf' && <embed src={url} type="application/pdf" width="500px" height="600px" />}
            {mediaType === 'unsupported' && <div>Unsupported media type</div>}
        </div>
    );
}

export default DisplayMedia;