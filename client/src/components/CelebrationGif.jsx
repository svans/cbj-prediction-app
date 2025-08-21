// client/src/components/CelebrationGif.jsx
import React, { useState, useEffect } from 'react';

const CelebrationGif = ({ winningTeam }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 4000); // GIF will be visible for 4 seconds

        return () => clearTimeout(timer);
    }, []);

    const cbjWinGif = 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/2351334/chippendale.0.gif';
    const cbjLoseGif = 'https://i.pinimg.com/originals/34/69/56/346956d4f4c66cddab696870b0ad4e9c.gif';

    const gifSrc = winningTeam === 'CBJ' ? cbjWinGif : cbjLoseGif;

    if (!visible) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
            <img src={gifSrc} alt="Celebration Gif" className="h-48 rounded-lg shadow-lg" />
        </div>
    );
};

export default CelebrationGif;
