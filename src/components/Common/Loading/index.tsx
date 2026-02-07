import './index.scss';
import React from 'react';

interface LoadingProps {
    title?: string | React.ReactNode;
}

const Loading: React.FC<LoadingProps> = ({title = ''}) => {
    return (
        <div className={`h-full w-full flex items-center justify-center relative`}>
            <div className="absolute mx-auto left-0 right-0 bottom-[30%] w-fit">{title}</div>
            <div className="loader-container">
                <div className="loader-child"></div>
                <div className="loader-child"></div>
                <div className="loader-child"></div>
            </div>
        </div>
    );
};

export default Loading;
