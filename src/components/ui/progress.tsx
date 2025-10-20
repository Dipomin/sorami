import React from 'react';

interface ProgressProps {
    progress: number; // Progress percentage (0 to 100)
}

const Progress: React.FC<ProgressProps> = ({ progress }) => {
    return (
        <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
                <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                        Progress
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-teal-600">
                        {progress}%
                    </span>
                </div>
            </div>
            <div className="flex h-2 mb-4 overflow-hidden text-xs bg-gray-200 rounded">
                <div
                    style={{ width: `${progress}%` }}
                    className="flex flex-col text-center text-white bg-teal-500 shadow-none"
                />
            </div>
        </div>
    );
};

export default Progress;