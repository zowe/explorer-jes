/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

import expect from 'expect';
import treeNodesJobs, { ROOT_NODE_ID } from '../../WebContent/js/reducers/treeNodesJobs';
import * as treeNodesJobsActions from '../../WebContent/js/actions/treeNodesJobs';
import * as treeNodesJobsResources from '../testResources/reducers/treeNodesJobs';

describe('Reducer: treeNodesJobs', () => {
    it('Should return the INITIAL_TREE_NODES_STATE', () => {
        expect(treeNodesJobs(undefined, {})).toEqual(treeNodesJobsResources.baseTreeNodesJobs);
    });

    it('Should handle RECEIVE_CHILDREN (ROOT_NODE_TYPE) and process childData relating to one Job', () => {
        const action = {
            type: treeNodesJobsActions.RECEIVE_CHILDREN,
            nodeId: ROOT_NODE_ID,
            childData: treeNodesJobsResources.treeNodesJobsChildDataATLJ0003,
            autoExpandChildren: false,
        };
        expect(treeNodesJobs(treeNodesJobsResources.baseTreeNodesJobs, action)).toEqual(treeNodesJobsResources.receivedTreeNodesJobs);
    });

    it('Should handle RECEIVE_CHILDREN (ROOT_NODE_TYPE) and process childData relating to one Job with auto expand enabled', () => {
        const action = {
            type: treeNodesJobsActions.RECEIVE_CHILDREN,
            nodeId: ROOT_NODE_ID,
            childData: treeNodesJobsResources.treeNodesJobsChildDataATLJ0003,
            autoExpandChildren: true,
        };
        expect(treeNodesJobs(treeNodesJobsResources.baseTreeNodesJobs, action)).toEqual(treeNodesJobsResources.receivedTreeNodesJobsAutoToggle);
    });

    it('Should handle RECEIVE_CHILDREN (JOB_STEP_PARENT_NODE_TYPE) and process childData relating to the steps of a job', () => {
        const action = {
            type: treeNodesJobsActions.RECEIVE_CHILDREN,
            nodeId: 'jobs/ATLJ0003/ids/JOB05944/steps',
            childData: treeNodesJobsResources.treeNodesJobsChildDataSteps,
            autoExpandChildren: false,
        };
        expect(treeNodesJobs(treeNodesJobsResources.toggledTreeNodesJobs, action)).toEqual(treeNodesJobsResources.receivedStepsTreeNodesJobs);
    });

    it('Should handle RECEIVE_CHILDREN (JOB_OUTPUT_FILE_PARENT_NODE_TYPE) and process childData relating to the files of a job', () => {
        const action = {
            type: treeNodesJobsActions.RECEIVE_CHILDREN,
            nodeId: 'jobs/ATLJ0003/ids/JOB05944/files',
            childData: treeNodesJobsResources.treeNodesJobsChildDataFiles,
            autoExpandChildren: false,
        };
        expect(treeNodesJobs(treeNodesJobsResources.toggledTreeNodesJobs, action)).toEqual(treeNodesJobsResources.receivedFilesTreeNodesJobs);
    });

    it('Should handle RECEIVE_CHILDREN (JOB_STEP_NODE_TYPE) and process childData relating to nodes of a step', () => {
        const action = {
            type: treeNodesJobsActions.RECEIVE_CHILDREN,
            nodeId: 'jobs/ATLJ0003/ids/JOB05944/steps/1',
            childData: treeNodesJobsResources.treeNodesJobsChildDataStepsNodes,
            autoExpandChildren: false,
        };
        expect(treeNodesJobs(treeNodesJobsResources.toggledStepsTreeNodesJobs, action)).toEqual(treeNodesJobsResources.receivedStepsNodesTreeNodesJobs);
    });
});
