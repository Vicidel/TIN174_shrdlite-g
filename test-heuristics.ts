import {Literal, DNFFormula, ShrdliteResult} from "./Types";
import {heuristics, H} from "./Heuristics";
import {ExampleWorlds} from "./ExampleWorlds";
import {parse} from "./Parser";
import {interpret} from "./Interpreter";


interface TestCase {
    world : string;
    statement : Literal;
    expectedCost : number
}


var cases : TestCase[] = [];

// 2D cases, commented for 3D shrdlite
// // #1
// cases.push({world : "small", statement : {relation : "holding", args : ["SmallBlackBall"], polarity : true}, expectedCost : 1});
//
// // #2
// cases.push({world : "small", statement : {relation : "inside", args : ["LargeWhiteBall", "LargeRedBox"], polarity : true}, expectedCost : 2});
//
// // #3
// cases.push({world : "small", statement : {relation : "inside", args : ["LargeWhiteBall", "LargeYellowBox"], polarity : true}, expectedCost : 6});
//
// // #4
// cases.push({world : "small", statement : {relation : "ontop", args : ["LargeWhiteBall", "floor"], polarity : true}, expectedCost : 0});
//
// // #5
// cases.push({world : "small", statement : {relation : "holding", args : ["LargeYellowBox"], polarity : true}, expectedCost : 5});
//
// // #6
// cases.push({world : "complex", statement : {relation : "under", args : ["LargeRedPlank", "SmallGreenPlank"], polarity : true}, expectedCost : 8});
//
// // #7
// cases.push({world : "complex", statement : {relation : "ontop", args : ["SmallBlueBox", "floor"], polarity : true}, expectedCost : 8});
//
// // #8
// cases.push({world : "medium", statement : {relation : "ontop", args : ["LrgGrnBrck1", "floor"], polarity : true}, expectedCost : 1});
//
// // #9
// cases.push({world : "complex", statement : {relation : "ontop", args : ["SmallGreenPlank", "SmallRedPyramid"], polarity : true}, expectedCost : 8});
//
// // #10
// cases.push({world : "medium", statement : {relation : "ontop", args : ["LrgGrnBrck1", "LrgYlwPrmd"], polarity : true}, expectedCost : 7});
//
// // #11
// cases.push({world : "medium", statement : {relation : "under", args : ["LrgGrnBrck1", "LrgYlwPrmd"], polarity : true}, expectedCost : 7});
//
// // #12
// cases.push({world : "small", statement : {relation : "leftof", args : ["LargeYellowBox", "SmallBlueBox"], polarity : true}, expectedCost : 4});
//
// // #13
// cases.push({world : "small", statement : {relation : "leftof", args : ["SmallBlueBox", "LargeYellowBox"], polarity : true}, expectedCost : 4});




// 3D Cases
// #1
cases.push({world : "small-3d", statement : {relation : "ontop", args : ["LargeWhiteBall", "LargeBlackBox"], polarity : true}, expectedCost : 4});

// #2
cases.push({world : "small-3d", statement : {relation : "before", args : ["SmallBlueBall", "LargeYellowBox"], polarity : true}, expectedCost : 4});

// #3
cases.push({world : "small-3d", statement : {relation : "behind", args : ["LargeBlackBox", "LargeWhiteBall"], polarity : true}, expectedCost : 8});




console.log("Running test cases for heuristics");
console.log("");
console.log("First tests for H function");
console.log("");
var i = 1;
for (var testCase of cases) {
    console.log("Test case #" + i);
    var h = H(testCase.statement, ExampleWorlds[testCase.world]);
    console.log("Calculated H: " + h + " and expected optimal cost: " + testCase.expectedCost);
    if (h > testCase.expectedCost) {
        console.log("ERROR: heuristic comes up with higher value than it should")
    }
    else {
        console.log("Test passed!")
    }
    console.log("");
    i++;
}