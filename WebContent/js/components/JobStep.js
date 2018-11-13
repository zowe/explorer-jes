import PropTypes from 'prop-types';
import React from 'react';

const JobStep = props => {
    const { step } = props;
    return (
        <li>
            <span>{step.label}</span>
        </li>);
};
export default JobStep;

JobStep.propTypes = {
    step: PropTypes.shape({
        label: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
    }),
};
