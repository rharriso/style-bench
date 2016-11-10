import _ from 'lodash';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import phantom from 'phantom';

const MAX_NODE_COUNT = 1500;
let nodeCount = 0;
const MAX_DEPTH = 50;

class TreeNode extends React.Component {
  render(){
    if (nodeCount > MAX_NODE_COUNT || this.props.currDepth >= MAX_DEPTH) {
      return null;
    }
    nodeCount++;

    let children = _.times(_.random(1, 5), () => {
      const child = <TreeNode currDepth={this.props.currDepth + 1}/>;
      return child;
    });

    const style = {
      display: 'inline-block',
      height: _.random(200, 1000),
      width: _.random(200, 1000)
    };

    return <div style={style}>{children}</div>;
  }
}

const html = ReactDOMServer.renderToString(<TreeNode currDepth={0} />);

function loadHtml(html) {
  let phInstance;
  let sitePage;

  return phantom.create()
    .then(instance => {
      phInstance = instance;
      return instance.createPage();
    })
    .then(page => {
      sitePage = page;
      return page.on('onLoadFinished', function (){
        page.evaluate(function (){
          var t = performance.timing;
          return t.loadEventEnd - t.responseEnd;
        }).then(function (timing){
          console.log(timing);
        });
      });
    })
    .then(() => {
      return sitePage.setContent(html, 'http://localhost');
    })
    .then(() => {
      return sitePage.property('content');
    })
    .then(()=> {
      sitePage.close();
      phInstance.exit();
    })
    .catch(error => {
      console.log(error);
      phInstance.exit();
    });
}

//loadHtml(html);
_.times(100, _.partialRight(loadHtml, html));
