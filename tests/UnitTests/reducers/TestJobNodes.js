/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

import expect from 'expect';
import JobNodes from '../../../WebContent/js/reducers/jobNodes';
import * as jobNodesActions from '../../../WebContent/js/actions/jobNodes';
import * as jobNodesResources from '../testResources/reducers/jobNodesResources';
import * as jobNodesActionResources from '../testResources/actions/jobNodesResources';
import * as filtersResources from '../testResources/actions/filters';

describe('Reducer: jobNodes', () => {
    it('Should return the INITIAL_STATE', () => {
        expect(JobNodes(undefined, {})).toEqual(jobNodesResources.initialState);
    });

    it('Should handle REQUEST_JOBS and set isFetching to true', () => {
        const action = {
            type: jobNodesActions.REQUEST_JOBS,
            filters: filtersResources.defaultFilter,
        };
        expect(JobNodes(jobNodesResources.initialState, action)).toEqual(jobNodesResources.requestedJobsState);
    });

    it('Should handle RECEIVE_JOBS, process job data with only one jobName and set isFetching to false', () => {
        const action = {
            type: jobNodesActions.RECEIVE_JOBS,
            jobs: jobNodesActionResources.jobFetchResponseSingleJobName,
        };
        expect(JobNodes(jobNodesResources.initialState, action)).toEqual(jobNodesResources.receivedJobsStateSingleJobName);
    });

    it('Should handle RECEIVE_JOBS, process job data with multiple jobNames and set isFetching to false', () => {
        const action = {
            type: jobNodesActions.RECEIVE_JOBS,
            jobs: jobNodesActionResources.jobFetchResponse,
        };
        expect(JobNodes(jobNodesResources.initialState, action)).toEqual(jobNodesResources.receivedJobsState);
    });

    it('Should handle INVALIDATE_JOBS and set isFetching to true', () => {
        const action = {
            type: jobNodesActions.INVALIDATE_JOBS,
        };
        expect(JobNodes(jobNodesResources.requestedJobsState, action)).toEqual(jobNodesResources.initialState);
    });

    it('Should handle TOGGLE_JOB and set isToggled to true for a given job', () => {
        const action = {
            type: jobNodesActions.TOGGLE_JOB,
            jobId: jobNodesActionResources.jobId,
        };
        expect(JobNodes(jobNodesResources.receivedJobsState, action)).toEqual(jobNodesResources.toggledJobState);
    });

    it('Should handle INVERT_JOB_SELECT_STATUS and invert isSelected to true', () => {
        const action = {
            type: jobNodesActions.INVERT_JOB_SELECT_STATUS,
            jobId: jobNodesActionResources.jobId,
        };
        expect(JobNodes(jobNodesResources.receivedJobsStateSingleJobName, action)).toEqual(jobNodesResources.selectedSignleJobState);
    });

    it('Should handle INVERT_JOB_SELECT_STATUS and invert isSelected to false', () => {
        const action = {
            type: jobNodesActions.INVERT_JOB_SELECT_STATUS,
            jobId: jobNodesActionResources.jobId,
        };
        expect(JobNodes(jobNodesResources.selectedSignleJobState, action)).toEqual(jobNodesResources.receivedJobsStateSingleJobName);
    });

    it('Should handle INVERT_JOB_SELECT_STATUS and invert isSelected to true when there are multiple jobs', () => {
        const action = {
            type: jobNodesActions.INVERT_JOB_SELECT_STATUS,
            jobId: jobNodesActionResources.jobId,
        };
        expect(JobNodes(jobNodesResources.receivedJobsState, action)).toEqual(jobNodesResources.oneSelectedJobs);
    });

    it('Should handle UNSELECT_ALL_JOBS and set all jobs isSelected to false', () => {
        const action = { type: jobNodesActions.UNSELECT_ALL_JOBS };
        expect(JobNodes(jobNodesResources.allSelectedJobs, action)).toEqual(jobNodesResources.receivedJobsState);
    });

    it('Should handle UNSELECT_ALL_JOBS and set all jobs isSelected to false when only one job was selected', () => {
        const action = { type: jobNodesActions.UNSELECT_ALL_JOBS };
        expect(JobNodes(jobNodesResources.oneSelectedJobs, action)).toEqual(jobNodesResources.receivedJobsState);
    });

    it('Should handle UNSELECT_ALL_JOBS and set all jobs isSelected to false when already false', () => {
        const action = { type: jobNodesActions.UNSELECT_ALL_JOBS };
        expect(JobNodes(jobNodesResources.receivedJobsState, action)).toEqual(jobNodesResources.receivedJobsState);
    });

    it('Should handle REQUEST_JOB_FILES and set isFetching to true', () => {
        const action = {
            type: jobNodesActions.REQUEST_JOB_FILES,
        };
        expect(JobNodes(jobNodesResources.receivedJobsStateSingleJobName, action)).toEqual(jobNodesResources.requestFilesState);
    });

    it('Should handle RECEIVE_JOB_FILES and process received files', () => {
        const action = {
            type: jobNodesActions.RECEIVE_JOB_FILES,
            jobId: jobNodesActionResources.jobId,
            jobFiles: jobNodesActionResources.jobFiles,
        };
        expect(JobNodes(jobNodesResources.requestFilesState, action)).toEqual(jobNodesResources.receivedJobFiles);
    });

    it('Should handle STOP_REFRESH_ICON and set isFetching to false', () => {
        const action = {
            type: jobNodesActions.STOP_REFRESH_ICON,
        };
        expect(JobNodes(jobNodesResources.receivedJobFiles, action)).toEqual(jobNodesResources.receivedFiles);
    });
});
