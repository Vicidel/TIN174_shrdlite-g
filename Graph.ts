
import Set from "./lib/typescript-collections/src/lib/Set";
import PriorityQueue from "./lib/typescript-collections/src/lib/PriorityQueue";

/********************************************************************************
** Graph

This module contains types for generic graphs, and
an implementation of the A* algorithm.

You should change the function 'aStarSearch'. 
Everything else can be leaved as they are.
********************************************************************************/


// An edge in a directed weighted graph

export class Edge<Node> {
    from : Node;
    to   : Node;
    cost : number;
}


// The minimal interface for a directed weighted graph

export interface Graph<Node> {
    outgoingEdges(node : Node) : Edge<Node>[];
    compareNodes : CompareFunction<Node>;
}


// Comparing two elements:
// if a<b then the result should be <0, if a>b then the result should be >0

interface CompareFunction<T> {
    (a: T, b: T): number;
}


// The class for search results. This is what the function 'aStarSearch' should return.
// If the search fails, then the 'path' should be 'null'.
// The 'path' should include both the start and the goal nodes.

export class SearchResult<Node> {
    constructor(
        public path : Node[],     // The path found by the search algorithm.
        public cost : number,     // The total cost of the path.
        public frontier : number, // The number of nodes in the frontier at return time
        public visited : number,  // The number of nodes that have been removed from the frontier
        public timeout : boolean, // True if the search fails because of timeout
    ) {};
}



// Defines a class to use in the A* search
// Contains one node, its cost and its parent structure

export class extendedNode<Node> {
    constructor(
        public state : Node,				// Node
        public cost : number,				// cost (g)
        public total_cost : number,			// total cost (f=g+h)
        public parent : extendedNode<Node>	// parent structure
    ) {};
}




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

export function aStarSearch<Node> (
    graph : Graph<Node>,
    start : Node,
    goal : (n:Node) => boolean,
    heuristics : (n:Node) => number,
    timeout : number) : SearchResult<Node> 
{
	// defines a variable to store the number of node checked
	var node_checked : number = 0;

    // define a first empty SearchResult
    var result : SearchResult<Node> = new SearchResult<Node>(null, 0, 0, 0, false);

    // function starting time definition
    var start_time = (new Date()).valueOf();

    // define the frontier
    var frontier : PriorityQueue<extendedNode<Node>> = new PriorityQueue<extendedNode<Node>>
    	((a: extendedNode<Node>, b : extendedNode<Node>) : number  => b.total_cost - a.total_cost);
    
    // defines and add the starting node in the frontier
    var working_node : extendedNode<Node> = new extendedNode<Node>(start, 0, heuristics(start), null);
    frontier.enqueue(working_node);

    // define the explored list as a set of Node
    var explored : Set<Node> = new Set<Node>();

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
        if(explored.contains(working_node.state)) {
        	continue;
        }

        // if working node is the goal, stop the search
        if(goal(working_node.state)) {
            break;
        }

        // add working node to the explored list
        explored.add(working_node.state);

        // explore neighbor with for loop
        for (var neighbor of graph.outgoingEdges(working_node.state)) {

        	// if explored does not contain neighbor.to then add it to the frontier for next occurence
            if (!explored.contains(neighbor.to)) {
            	var temp_cost : number = working_node.cost + neighbor.cost;
            	var temp_total_cost : number = working_node.cost + neighbor.cost + heuristics(neighbor.to);
            	var next : extendedNode<Node> = new extendedNode<Node>(neighbor.to, temp_cost, temp_total_cost, working_node);
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
		if(working_node.parent == null) {
			break; 
		} else {
			working_node = working_node.parent;
		}
	}
	result.path = (result.path).reverse();

    return result;
}