import _ from 'lodash';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const MAX_NODE_COUNT = 1500;
let nodeCount = 0;
const MAX_DEPTH = 100;

class TreeNode extends React.Component {
  render(){
    if (nodeCount >= MAX_NODE_COUNT || this.props.currDepth >= MAX_DEPTH) {
      return null;
    }
    nodeCount++;

    let children = _.times(_.random(1, 5), () => {
      const child = <TreeNode currDepth={this.props.currDepth + 1}/>;
      return child;
    });
    return <div>{children}</div>;
  }
}


ReactDOMServer.renderToString(<TreeNode currDepth={0} />);
console.log(nodeCount);
