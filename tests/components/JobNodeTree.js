import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import { Map } from 'immutable';
import { JobNodeTree } from '../../WebContent/js/containers/JobNodeTree';
import { ROOT_NODE_TYPE, JOB_NAME_NODE_TYPE } from '../../WebContent/js/jobNodeTypesConstants';

function setUpJobNodeTree(nodeType, isFetching) {
    const props = {
        rootJobNode: Map({
            nodeType,
            isFetchingChildren: isFetching,
            toggled: false,
        }),
    };
    return shallow(<JobNodeTree {...props} />);
}

function testCheckIfFetchingChildren(rootJobNode, expected) {
    const nodeType = rootJobNode.get('nodeType');
    const isFetchingChildren = rootJobNode.get('isFetchingChildren');
    const jodNodeTree = setUpJobNodeTree(nodeType, isFetchingChildren);
    it(`checkIfFetchingChildren should return ${expected} when node type is ${nodeType} and isFetchingChildren ${isFetchingChildren}`, () => {
        expect(jodNodeTree.instance().checkIfFetchingChildren()).toEqual(expected);
    });
}

describe('Container: JobNodeTree', () => {
    testCheckIfFetchingChildren(Map({ nodeType: ROOT_NODE_TYPE, isFetchingChildren: false }), false);
    testCheckIfFetchingChildren(Map({ nodeType: ROOT_NODE_TYPE, isFetchingChildren: true }), true);
    testCheckIfFetchingChildren(Map({ nodeType: JOB_NAME_NODE_TYPE, isFetchingChildren: false }), false);
    testCheckIfFetchingChildren(Map({ nodeType: JOB_NAME_NODE_TYPE, isFetchingChildren: true }), false);
});
