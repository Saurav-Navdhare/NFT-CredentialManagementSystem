import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function DisplayMedia({ url, className = "" }) {
    const [mediaType, setMediaType] = useState(null);
    const [finalUrl, setFinalUrl] = useState(url);
    useEffect(() => {
        const fetchMediaType = async () => {
            try {
                let contentType = null;

                if (url.startsWith('blob:')) {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    contentType = blob.type;
                } else {
                    // Fetch HEAD to follow redirects and get final URL
                    let response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
                    if (!response.ok && response.status === 405) {
                        // Some servers don't support HEAD, fallback to GET
                        response = await fetch(url, { method: 'GET', redirect: 'follow' });
                    }
                    setFinalUrl(response.url);
                    contentType = response.headers.get('Content-Type');
                }

                if (contentType && contentType.includes('image')) {
                    setMediaType('image');
                } else if (contentType === 'application/pdf') {
                    setMediaType('pdf');
                } else {
                    setMediaType('unsupported');
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
            {mediaType === 'image' && <img src={`${finalUrl}`} alt="media" style={{ maxWidth: '500px', maxHeight: '600px' }} />}
            {mediaType === 'pdf' && <embed src={`${finalUrl}`} type="application/pdf" width="500px" height="600px" />}
            {mediaType === 'unsupported' && <div>Unsupported media type</div>}
        </div>
    );
}

DisplayMedia.propTypes = {
    className: PropTypes.string,
    url: PropTypes.string.isRequired,
};

export default DisplayMedia;
