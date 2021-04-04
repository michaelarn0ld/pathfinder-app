import React from 'react';
import Node from './Node';
import { useEffect } from 'react';
import './App.scss';

function App() {
  const nodes = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(true);
    }
    nodes.push(currentRow);
  }

  let documentNodes;
  let wallToggle = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'w') wallToggle = true;
  });

  document.addEventListener('keyup', () => {
    wallToggle = false;
  });

  useEffect(() => {
    documentNodes = document.querySelectorAll('.node');
    documentNodes.forEach((node) => {
      node.addEventListener('mouseover', () => {
        if (wallToggle) node.classList.add('wall');
      });
    });
  });

  let startNode;
  let endNode;
  let endSearch;
  let searchTime = 0;
  let routeTime = 0;
  let parcelNode;
  const parcels = [];
  const directions = [];
  let trigger = false;

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------

  const startButton = () => {
    documentNodes.forEach((node) => {
      if (node.classList.contains('start-node'))
        node.classList.remove('start-node');
    });
    document.addEventListener('mouseup', function startNodeHandler(e) {
      e.currentTarget.removeEventListener(e.type, startNodeHandler);
      startNode = document.elementFromPoint(e.pageX, e.pageY - 15);
      startNode.classList.add('start-node');
    });
  };

  const endButton = () => {
    documentNodes.forEach((node) => {
      if (node.classList.contains('end-node'))
        node.classList.remove('end-node');
    });
    document.addEventListener('mouseup', function endNodeHandler(e) {
      e.currentTarget.removeEventListener(e.type, endNodeHandler);
      endNode = document.elementFromPoint(e.pageX, e.pageY - 15);
      endNode.classList.add('end-node');
    });
  };

  const addAddress = () => {
    document.addEventListener('mouseup', function parcelNodeHandler(e) {
      e.currentTarget.removeEventListener(e.type, parcelNodeHandler);
      parcelNode = document.elementFromPoint(e.pageX, e.pageY - 15);
      parcelNode.classList.remove('address');
      parcelNode.classList.add('address');
      if (
        !parcels.includes(parcelNode) &&
        parcelNode.classList.value.includes('node')
      )
        parcels.push(parcelNode);
    });
  };

  const pathButton = () => {
    const nodesArray = [...documentNodes].map((node) => node.classList);
    const stringifyNodesArray = [...documentNodes].map((item) => {
      if (!item.classList.value.includes('wall')) {
        let splitter = item.classList.value.split(' ');
        return `${splitter[0]} ${splitter[1]} ${splitter[2]}`;
      }
      return item.classList.value;
    });

    const graph = nodesArray.map((node) => {
      const row = Number(node[1].substring(1));
      const col = Number(node[2].substring(1));

      const thisNode = `.node.R${row}.C${col}`;

      const upNode = stringifyNodesArray.includes(`node R${row - 1} C${col}`)
        ? `.node.R${row - 1}.C${col}`
        : null;
      const downNode = stringifyNodesArray.includes(`node R${row + 1} C${col}`)
        ? `.node.R${row + 1}.C${col}`
        : null;
      const leftNode = stringifyNodesArray.includes(`node R${row} C${col - 1}`)
        ? `.node.R${row}.C${col - 1}`
        : null;
      const rightNode = stringifyNodesArray.includes(`node R${row} C${col + 1}`)
        ? `.node.R${row}.C${col + 1}`
        : null;

      let nodeGraph = Object.create(null);
      nodeGraph[thisNode] = [upNode, downNode, leftNode, rightNode].filter(
        (item) => item != null
      );

      return nodeGraph;
    });

    let newGraph = Object.create(null);
    for (let i = 0; i < graph.length; i++) {
      newGraph[Object.keys(graph[i])[0]] = graph[i][Object.keys(graph[i])[0]];
    }

    for (let parcel of parcels) {
      let item = parcel.classList.value.split(' ');
      directions.push(`.${item[0]}.${item[1]}.${item[2]}`);
    }

    function findRoute(graph, from, to) {
      if (to.length === 0 && !trigger) {
        endSearch = from;
        triggerEndNode();
        return;
      } else if (to.length === 0 && trigger) {
        return;
      }

      let work = [{ at: from, route: [] }];
      for (let i = 0; i < work.length; i++) {
        searchTime = 4 * i;
        setTimeout(() => {
          document.querySelector(`${work[i].at}`).classList.add('travel');
        }, searchTime);
        let { at, route } = work[i];
        for (let place of graph[at]) {
          if (to.includes(place)) {
            let index = to.indexOf(place);
            let pop = to.splice(index, 1);

            for (let j = 0; j < route.length; j++) {
              routeTime = searchTime;
              setTimeout(() => {
                document.querySelector(`${route[j]}`).classList.add('route');
              }, 60 * j + searchTime);
              routeTime += 60 * j;
            }

            return setTimeout(() => {
              findRoute(graph, pop, to);
            }, routeTime);
          }
          if (!work.some((w) => w.at == place)) {
            work.push({ at: place, route: route.concat(place) });
          }
        }
      }
    }

    // --------------------------------------------------------------
    let startGraph = startNode.classList.value.split(' ');
    startGraph = `.${startGraph[0]}.${startGraph[1]}.${startGraph[2]}`;

    let endGraph = endNode.classList.value.split(' ');
    endGraph = `.${endGraph[0]}.${endGraph[1]}.${endGraph[2]}`;

    findRoute(newGraph, startGraph, directions);

    let p = new Promise((resolve, reject) => {
      let response = true;
      if (response) resolve('success');
      else reject('failure');
    });

    const triggerEndNode = () => {
      trigger = true;
      p.then(() => findRoute(newGraph, endSearch[0], [endGraph]));
    };
  };

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------

  return (
    <div className="main">
      <div className="buttons">
        <h2 onMouseDown={() => startButton()}>Start</h2>
        <h2 onMouseDown={() => endButton()}>End</h2>
        <h2 onMouseDown={() => addAddress()}>Add Address</h2>
        <h2 onClick={() => pathButton()}>Find Path</h2>
      </div>
      {nodes.map((row, index) => {
        let rowIdx = index;
        return (
          <div className="row" key={index}>
            {row.map((col, index) => {
              return <Node key={(rowIdx, index)} row={rowIdx} col={index} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default App;
