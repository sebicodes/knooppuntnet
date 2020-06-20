var emitPath = function (networkType, routeId, path) {
  if (path) {
    var key = [
      networkType,
      routeId,
      path.pathId
    ];
    var value = [
      path.startNodeId,
      path.endNodeId,
      path.meters
    ];
    emit(key, value);

    if (!path.oneWay) {
      var backwardKey = [
        networkType,
        routeId,
        - path.pathId
      ];
      var backwardValue = [
        path.endNodeId,
        path.startNodeId,
        path.meters
      ];
      emit(backwardKey, backwardValue);
    }
  }
};

var emitPaths = function (networkType, routeId, paths) {
  if (paths) {
    for (i = 0; i < paths.length; i++) {
      emitPath(networkType, routeId, paths[i]);
    }
  }
};

if (doc && doc.route && doc.route.analysis && doc.route.active === true) {

  var networkType = doc.route.summary.networkType;
  var routeId = doc.route.summary.id;
  var routeMap = doc.route.analysis.map;

  emitPath(networkType, routeId, routeMap.forwardPath);
  emitPath(networkType, routeId, routeMap.backwardPath);
  emitPaths(networkType, routeId, routeMap.startTentaclePaths);
  emitPaths(networkType, routeId, routeMap.endTentaclePaths);
}
