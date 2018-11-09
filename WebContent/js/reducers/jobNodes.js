import { Map, List } from 'immutable';

import {
    REQUEST_JOBS,
    RECEIVE_JOBS,
    TOGGLE_JOB,
    REQUEST_JOB_FILES,
    RECEIVE_JOB_FILES,
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

function extractJobs(jobs) {
    const jobList = jobs.map(job => {
        return job.jobInstances.map(jobInstance => {
            return {
                jobName: jobInstance.jobName,
                jobId: jobInstance.jobId,
                label: `${jobInstance.jobName}:${jobInstance.jobId}`,
                isToggled: false,
                files: [],
                steps: [],
            };
        });
    });
    // At this point we have an array of (arrays for each jobName), we need to flatten
    // [[abc:123, abc:456], [def:123, def:456]]
    return jobList.flat();
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

function createJobWithFile(jobs, jobId, jobFiles) {
    return jobs.get(findKeyOfJob(jobs, jobId)).set('files', extractJobFiles(jobFiles));
}

export default function JobNodes(state = INITIAL_STATE, action) {
    switch (action.type) {
        case REQUEST_JOBS:
            return state.set('isFetching', true);
        case RECEIVE_JOBS:
            return state.merge({ jobs: extractJobs(action.jobs), isFetching: false });
        case TOGGLE_JOB:
            return state.merge({
                jobs: state.get('jobs').set(findKeyOfJob(state.get('jobs'), action.jobId), toggleJob(state.get('jobs'), action.jobId)),
            });
        case REQUEST_JOB_FILES:
            return state.set('isFetching', true);
        case RECEIVE_JOB_FILES:
            return state.merge({
                jobs: state.get('jobs').set(findKeyOfJob(state.get('jobs'), action.jobId), createJobWithFile(state.get('jobs'), action.jobId, action.jobFiles)),
                isFetching: false,
            });

        default:
            return state;
    }
}
