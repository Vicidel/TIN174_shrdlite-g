(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./lib/typescript-collections/src/lib/Set", "./lib/typescript-collections/src/lib/PriorityQueue"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Set_1 = require("./lib/typescript-collections/src/lib/Set");
    var PriorityQueue_1 = require("./lib/typescript-collections/src/lib/PriorityQueue");
    /********************************************************************************
    ** Graph
    
    This module contains types for generic graphs, and
    an implementation of the A* algorithm.
    
    You should change the function 'aStarSearch'.
    Everything else can be leaved as they are.
    ********************************************************************************/
    // An edge in a directed weighted graph
    var Edge = (function () {
        function Edge() {
        }
        return Edge;
    }());
    exports.Edge = Edge;
    // The class for search results. This is what the function 'aStarSearch' should return.
    // If the search fails, then the 'path' should be 'null'.
    // The 'path' should include both the start and the goal nodes.
    var SearchResult = (function () {
        function SearchResult(path, // The path found by the search algorithm.
            cost, // The total cost of the path.
            frontier, // The number of nodes in the frontier at return time
            visited, // The number of nodes that have been removed from the frontier
            timeout) {
            this.path = path;
            this.cost = cost;
            this.frontier = frontier;
            this.visited = visited;
            this.timeout = timeout;
        }
        ;
        return SearchResult;
    }());
    exports.SearchResult = SearchResult;
    // Defines a class to use in the A* search
    // Contains one node, its cost and its parent structure
    var extendedNode = (function () {
        function extendedNode(state, // Node
            cost, // cost (g)
            total_cost, // total cost (f=g+h)
            parent // parent structure
        ) {
            this.state = state;
            this.cost = cost;
            this.total_cost = total_cost;
            this.parent = parent; // parent structure
        }
        ;
        return extendedNode;
    }());
    exports.extendedNode = extendedNode;
    /* A* search implementation, parameterised by a 'Node' type.
     * The code here is just a template; you should rewrite this function entirely.
     * This template produces a dummy search result which is a random walk.
     *
     * Note that you should not change the API (type) of this function, only its body.
     *
     * @param graph: The graph on which to perform A* search.
     * @param start: The initial node.
     * @param goal: A function that returns true when given a goal node. Used to determine if the algorithm has reached the goal.
     * @param heuristics: The heuristic function. Used to estimate the cost of reaching the goal from a given Node.
     * @param timeout: Maximum time (in seconds) to spend performing A* search.
     * @returns: A search result, which contains the path from 'start' to a node satisfying 'goal',
     *           the cost of this path, and some statistics.
     */
    function aStarSearch(graph, start, goal, heuristics, timeout) {
        // defines a variable to store the number of node checked
        var node_checked = 0;
        // define a first empty SearchResult
        var result = new SearchResult(null, 0, 0, 0, false);
        // function starting time definition
        var start_time = (new Date()).valueOf();
        // define the frontier
        var frontier = new PriorityQueue_1["default"](function (a, b) { return b.total_cost - a.total_cost; });
        // defines and add the starting node in the frontier
        var working_node = new extendedNode(start, 0, heuristics(start), null);
        frontier.enqueue(working_node);
        // define the explored list as a set of Node
        var explored = new Set_1["default"]();
        // while the frontier is not empty (aka if the algorithm can still do something)
        while (!frontier.isEmpty()) {
            // timeout check
            if ((new Date()).valueOf() - start_time > 1000 * timeout) {
                result.timeout = true;
                result.path = null;
                result.cost = working_node.cost;
                result.frontier = frontier.size();
                result.visited = node_checked;
                return result;
            }
            // take the working node from the frontier, ordering of PriorityQueue should do that it's the closer one
            working_node = frontier.dequeue();
            // one more node has been checked
            node_checked += 1;
            // need to continue if the working node is aready explored 
            if (explored.contains(working_node.state)) {
                continue;
            }
            // if working node is the goal, stop the search
            if (goal(working_node.state)) {
                break;
            }
            // add working node to the explored list
            explored.add(working_node.state);
            // explore neighbor with for loop
            for (var _i = 0, _a = graph.outgoingEdges(working_node.state); _i < _a.length; _i++) {
                var neighbor = _a[_i];
                // if explored does not contain neighbor.to then add it to the frontier for next occurence
                if (!explored.contains(neighbor.to)) {
                    var temp_cost = working_node.cost + neighbor.cost;
                    var temp_total_cost = working_node.cost + neighbor.cost + heuristics(neighbor.to);
                    var next = new extendedNode(neighbor.to, temp_cost, temp_total_cost, working_node);
                    frontier.enqueue(next);
                }
            }
        }
        // set result parameters
        result.cost = working_node.cost;
        result.frontier = frontier.size();
        result.visited = node_checked;
        // recreates the path from the working_node node
        result.path = result.path || [];
        while (true) {
            (result.path).push(working_node.state);
            if (working_node.parent == null) {
                break;
            }
            else {
                working_node = working_node.parent;
            }
        }
        result.path = (result.path).reverse();
        return result;
    }
    exports.aStarSearch = aStarSearch;
});
