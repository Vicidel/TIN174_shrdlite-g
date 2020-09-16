///<reference path="lib/node.d.ts"/>

import {TextWorld} from "./TextWorld";
import {ExampleWorlds} from "./ExampleWorlds";
import {ShrdliteResult} from "./Types";
import {parse} from "./Parser";
import {interpret} from "./Interpreter";
import {TestCase, testCases} from "./InterpreterTestCases";
import {physical_laws} from "./Interpreter"
import {SimpleObject} from "./Types"

/********************************************************************************
** test-interpreter

This is the main file for testing the interpreter implementation in Interpreter.ts.
It tests against several test cases that are defined in InterpreterTestCases.ts

You should not edit this file.
********************************************************************************/


function runTest(testcase : TestCase) : boolean {

	console.log('/// \n');

    var obj1 : SimpleObject = new SimpleObject("small", "blue", "ball");
    var string_action : string = "ontop";
    var obj2 : SimpleObject = new SimpleObject("large", "blue", "floor");
    var string_test : string = physical_laws(string_action, obj1, obj2);
    console.log("Checking instruction :", obj1.toStringAdv(), string_action, obj2.toStringAdv(), ":");
    console.log(string_test);

    // obj1 = new SimpleObject("large", "blue", "plank");
    // string_action = "inside";
    // obj2 = new SimpleObject("small", "blue", "ball");
    // string_test = physical_laws(string_action, obj1, obj2);
    // console.log("Checking instruction :", obj1.toStringAdv(), string_action, obj2.toStringAdv(), ":");
    // console.log(string_test);

    // obj1 = new SimpleObject("small", "blue", "ball");
    // string_action = "ontop";
    // obj2 = new SimpleObject("large", "blue", "table");
    // string_test = physical_laws(string_action, obj1, obj2);
    // console.log("Checking instruction :", obj1.toStringAdv(), string_action, obj2.toStringAdv(), ":");
    // console.log(string_test);

    return false;
}


function runAllTests(argv : string[]) {
    
    var result = runTest(testCases[0]);
}


try {
    runAllTests(process.argv.slice(2));
} catch(err) {
    console.log();
    console.log("ERROR: " + err);
    console.log();
    console.log("Please give at least one argument:");
    console.log("- either a number (0.." + (testCases.length-1) + ") for each test you want to run,");
    console.log("- or 'all' for running all tests.");
    console.log();
}
