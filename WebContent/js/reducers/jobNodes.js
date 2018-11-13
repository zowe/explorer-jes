import { Map, List } from 'immutable';

import {
    REQUEST_JOBS,
    RECEIVE_JOBS,
    TOGGLE_JOB,
    REQUEST_JOB_FILES_AND_STEPS,
    RECEIVE_JOB_FILES,
    RECEIVE_JOB_STEPS,
    INVALIDATE_JOBS,
    STOP_REFRESH_ICON,
} from '../actions/jobNodes';

/**
jobs: [
    {
        jobName: MYJOB,
        jobID: JOB1234,
        label: MYJOB:JOB1234,
        files: [
            {
                label: JESMSG,
                id: 102,
            },
        ]
        steps: [
            {
                label: TODODODODO
            },
        ]
    }
]
*/

const INITIAL_STATE = Map({
    jobs: List(),
    isFetching: false,
});

function flattenArray(array) {
    return array.reduce((flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
    }, []);
}

function extractJobs(jobs) {
    const jobList = jobs.map(job => {
        return job.jobInstances.map(jobInstance => {
            return {
                jobName: jobInstance.jobName,
                jobId: jobInstance.jobId,
                label: `${jobInstance.jobName}:${jobInstance.jobId}`,
                returnCode: jobInstance.returnCode,
                status: jobInstance.status,
                isToggled: false,
                files: List(),
                steps: List(),
            };
        });
    });
    // At this point we have an array of (arrays for each jobName), we need to flatten
    // [[abc:123, abc:456], [def:123, def:456]]
    return flattenArray(jobList);
}

function findKeyOfJob(jobs, jobId) {
    return jobs.findKey(job => {
        return job.get('jobId') === jobId;
    });
}

function toggleJob(jobs, jobId) {
    const jobKey = findKeyOfJob(jobs, jobId);
    return jobs.get(jobKey).set('isToggled', !jobs.get(jobKey).get('isToggled'));
}

function extractJobFiles(jobFiles) {
    return jobFiles.map(file => {
        return {
            label: file.ddname,
            id: file.id,
        };
    });
}

function createJobWithFiles(jobs, jobId, jobFiles) {
    return jobs.get(findKeyOfJob(jobs, jobId)).set('files', extractJobFiles(jobFiles));
}

function extractJobSteps(jobSteps) {
    return jobSteps.map(step => {
        return {
            label: `${step.name}:${step.program}`,
            id: step.step,
        };
    });
}

function createJobWithSteps(jobs, jobId, jobSteps) {
    return jobs.get(findKeyOfJob(jobs, jobId)).set('steps', extractJobSteps(jobSteps));
}

export default function JobNodes(state = INITIAL_STATE, action) {
    switch (action.type) {
        case REQUEST_JOBS:
            return state.set('isFetching', true);
        case RECEIVE_JOBS:
            return state.merge({ jobs: extractJobs(action.jobs), isFetching: false });
        case INVALIDATE_JOBS:
            return state.set('isFetching', false);
        case TOGGLE_JOB:
            return state.merge({
                jobs: state.get('jobs').set(findKeyOfJob(state.get('jobs'), action.jobId), toggleJob(state.get('jobs'), action.jobId)),
            });
        case REQUEST_JOB_FILES_AND_STEPS:
            return state.set('isFetching', true);
        case RECEIVE_JOB_FILES:
            return state.merge({
                jobs: state.get('jobs').set(findKeyOfJob(state.get('jobs'), action.jobId), createJobWithFiles(state.get('jobs'), action.jobId, action.jobFiles)),
            });
        case RECEIVE_JOB_STEPS:
            return state.merge({
                jobs: state.get('jobs').set(findKeyOfJob(state.get('jobs'), action.jobId), createJobWithSteps(state.get('jobs'), action.jobId, action.jobSteps)),
            });
        case STOP_REFRESH_ICON:
            return state.set('isFetching', false);
        default:
            return state;
    }
}
