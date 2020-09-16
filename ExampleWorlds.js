(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Types"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Types_1 = require("./Types");
    /********************************************************************************
    ** ExampleWorlds
    
    Here you define the worlds that you can interact with.
    Feel free to add new worlds at will.
    ********************************************************************************/
    exports.ExampleWorlds = {};
    exports.ExampleWorlds["small"] = {
        "stacks": [[["LargeWhiteBall"],
                ["LargeBlueTable", "LargeRedBox"],
                [],
                ["LargeYellowBox", "SmallBlueBox", "SmallBlackBall"],
                []]],
        "holding": null,
        "arm": [0, 0],
        "objects": {
            "LargeWhiteBall": new Types_1.SimpleObject("large", "white", "ball"),
            "SmallBlackBall": new Types_1.SimpleObject("small", "black", "ball"),
            "LargeBlueTable": new Types_1.SimpleObject("large", "blue", "table"),
            "LargeYellowBox": new Types_1.SimpleObject("large", "yellow", "box"),
            "LargeRedBox": new Types_1.SimpleObject("large", "red", "box"),
            "SmallBlueBox": new Types_1.SimpleObject("small", "blue", "box"),
            "floor": new Types_1.SimpleObject(null, null, "floor")
        },
        "examples": [
            "put the white ball in a box on the floor",
            "put the black ball in a box on the floor",
            "take a blue object",
            "take the white ball",
            "put all boxes on the floor",
            "move all balls inside a large box"
        ]
    };
    exports.ExampleWorlds["medium"] = {
        "stacks": [[["LrgWhtBall"],
                ["LrgGrnBrck2", "LrgRedBox"],
                [],
                [],
                ["LrgYlwPrmd", "SmlRedTble", "SmlRedPrmd"],
                [],
                [],
                ["LrgYlwBox", "LrgBluTble", "LrgRedPlnk", "LrgGrnBrck3", "SmlWhtBrck"],
                [],
                ["SmlGrnPlnk", "SmlBluBox", "SmlBlkBall"]]],
        "holding": "LrgGrnBrck1",
        "arm": [0, 0],
        "objects": {
            "LrgGrnBrck1": new Types_1.SimpleObject("large", "green", "brick"),
            "LrgGrnBrck2": new Types_1.SimpleObject("large", "green", "brick"),
            "LrgGrnBrck3": new Types_1.SimpleObject("large", "green", "brick"),
            "SmlWhtBrck": new Types_1.SimpleObject("small", "white", "brick"),
            "LrgRedPlnk": new Types_1.SimpleObject("large", "red", "plank"),
            "SmlGrnPlnk": new Types_1.SimpleObject("small", "green", "plank"),
            "LrgWhtBall": new Types_1.SimpleObject("large", "white", "ball"),
            "SmlBlkBall": new Types_1.SimpleObject("small", "black", "ball"),
            "LrgBluTble": new Types_1.SimpleObject("large", "blue", "table"),
            "SmlRedTble": new Types_1.SimpleObject("small", "red", "table"),
            "LrgYlwPrmd": new Types_1.SimpleObject("large", "yellow", "pyramid"),
            "SmlRedPrmd": new Types_1.SimpleObject("small", "red", "pyramid"),
            "LrgYlwBox": new Types_1.SimpleObject("large", "yellow", "box"),
            "LrgRedBox": new Types_1.SimpleObject("large", "red", "box"),
            "SmlBluBox": new Types_1.SimpleObject("small", "blue", "box"),
            "floor": new Types_1.SimpleObject(null, null, "floor")
        },
        "examples": [
            "put the brick that is to the left of a pyramid in a box",
            "put the white ball in a box on the floor",
            "move the large ball inside a yellow box on the floor",
            "move the large ball inside a red box on the floor",
            "take a red object",
            "take the white ball",
            "put all boxes on the floor",
            "put the large plank under the blue brick",
            "move all bricks on a table",
            "move all balls inside a large box"
        ]
    };
    exports.ExampleWorlds["complex"] = {
        "stacks": [[["LargeWhiteBall"],
                ["LargeYellowBrick", "LargeRedBox"],
                ["LargeYellowPyramid", "SmallRedTable", "SmallRedPyramid"],
                ["LargeRedPlank", "LargeYellowBox", "LargeBlueTable", "SmallWhiteBrick"],
                ["SmallGreenPlank", "SmallBlueBox", "SmallBlackBall"]]],
        "holding": null,
        "arm": [0, 0],
        "objects": {
            "LargeYellowBrick": new Types_1.SimpleObject("large", "yellow", "brick"),
            "SmallWhiteBrick": new Types_1.SimpleObject("small", "white", "brick"),
            "LargeRedPlank": new Types_1.SimpleObject("large", "red", "plank"),
            "SmallGreenPlank": new Types_1.SimpleObject("small", "green", "plank"),
            "LargeWhiteBall": new Types_1.SimpleObject("large", "white", "ball"),
            "SmallBlackBall": new Types_1.SimpleObject("small", "black", "ball"),
            "LargeBlueTable": new Types_1.SimpleObject("large", "blue", "table"),
            "SmallRedTable": new Types_1.SimpleObject("small", "red", "table"),
            "LargeYellowPyramid": new Types_1.SimpleObject("large", "yellow", "pyramid"),
            "SmallRedPyramid": new Types_1.SimpleObject("small", "red", "pyramid"),
            "LargeYellowBox": new Types_1.SimpleObject("large", "yellow", "box"),
            "LargeRedBox": new Types_1.SimpleObject("large", "red", "box"),
            "SmallBlueBox": new Types_1.SimpleObject("small", "blue", "box"),
            "floor": new Types_1.SimpleObject(null, null, "floor")
        },
        "examples": [
            "put a box in a box",
            "put all balls on the floor",
            "take the yellow box",
            "put any object under all tables",
            "put any object under all tables on the floor",
            "put a ball in a small box in a large box",
            "put all balls in a large box",
            "put all balls left of a ball",
            "put all balls beside a ball",
            "put all balls beside every ball",
            "put a box beside all objects",
            "put all red objects above a yellow object on the floor",
            "put all yellow objects under a red object under an object"
        ]
    };
    exports.ExampleWorlds["impossible-2d"] = {
        "stacks": [[["LrgGrnBrck", "LrgWhtBall", "SmlYlwBrck"],
                [],
                ["LrgWhtPrmd", "LrgYlwBox", "LrgBlkPlnk", "SmlRedBall"],
                [],
                ["SmlBluBrck", "SmlRedBox", "SmlBluPrmd", "LrgGrnTble", "SmlBlkBall"]]],
        "holding": null,
        "arm": [0, 0],
        "objects": {
            "LrgGrnBrck": new Types_1.SimpleObject("large", "green", "brick"),
            "SmlYlwBrck": new Types_1.SimpleObject("small", "yellow", "brick"),
            "SmlBluBrck": new Types_1.SimpleObject("small", "blue", "brick"),
            "LrgRedPlnk": new Types_1.SimpleObject("large", "red", "plank"),
            "LrgBlkPlnk": new Types_1.SimpleObject("large", "black", "plank"),
            "SmlGrnPlnk": new Types_1.SimpleObject("small", "green", "plank"),
            "LrgWhtBall": new Types_1.SimpleObject("large", "white", "ball"),
            "SmlBlkBall": new Types_1.SimpleObject("small", "black", "ball"),
            "SmlRedBall": new Types_1.SimpleObject("small", "red", "ball"),
            "LrgGrnTble": new Types_1.SimpleObject("large", "green", "table"),
            "SmlRedTble": new Types_1.SimpleObject("small", "red", "table"),
            "LrgWhtPrmd": new Types_1.SimpleObject("large", "white", "pyramid"),
            "SmlBluPrmd": new Types_1.SimpleObject("small", "blue", "pyramid"),
            "LrgYlwBox": new Types_1.SimpleObject("large", "yellow", "box"),
            "SmlRedBox": new Types_1.SimpleObject("small", "red", "box"),
            "SmlBluBox": new Types_1.SimpleObject("small", "blue", "box"),
            "floor": new Types_1.SimpleObject(null, null, "floor")
        },
        "examples": [
            "this is just an impossible world"
        ]
    };
    exports.ExampleWorlds["cups"] = {
        "stacks": [[["LargeWhiteBall"],
                ["LargeBlueTable", "LargeGreenPyramid"],
                ["LargeWhiteCup", "LargeBlueCup", "LargeRedCup"],
                ["LargeYellowBox", "SmallBlueBox", "SmallBlackBall"],
                ["SmallWhiteCup"]]],
        "holding": null,
        "arm": [0, 0],
        "objects": {
            "LargeWhiteBall": new Types_1.SimpleObject("large", "white", "ball"),
            "SmallBlackBall": new Types_1.SimpleObject("small", "black", "ball"),
            "LargeBlueTable": new Types_1.SimpleObject("large", "blue", "table"),
            "LargeYellowBox": new Types_1.SimpleObject("large", "yellow", "box"),
            "SmallBlueBox": new Types_1.SimpleObject("small", "blue", "box"),
            "LargeWhiteCup": new Types_1.SimpleObject("large", "white", "cup"),
            "LargeBlueCup": new Types_1.SimpleObject("large", "blue", "cup"),
            "LargeRedCup": new Types_1.SimpleObject("large", "red", "cup"),
            "SmallWhiteCup": new Types_1.SimpleObject("small", "white", "cup"),
            "LargeGreenPyramid": new Types_1.SimpleObject("large", "green", "pyramid"),
            "floor": new Types_1.SimpleObject(null, null, "floor")
        },
        "examples": [
            "put the white ball in a box on the floor",
            "put the black ball in a box on the floor",
            "take a blue object",
            "take the white ball",
            "put all boxes on the floor",
            "move all balls inside a large box",
            "put a cup in a cup"
        ]
    };
    exports.ExampleWorlds["small-3d"] = {
        "stacks": [
            [
                ["SmallYellowTable"],
                ["LargeBlueBox", "SmallWhiteCup"],
                []
            ], [
                ["LargeGreenBrick", "SmallRedCup"],
                ["LargeBlueCup", "LargeRedCup"],
                [],
            ], [
                ["SmallWhitePlank", "SmallYellowPyramid"],
                [],
                ["LargeBlackBall"],
            ]
        ],
        "holding": null,
        "arm": [0, 0],
        "objects": {
            "LargeBlackBall": new Types_1.SimpleObject("large", "black", "ball"),
            "LargeBlueBox": new Types_1.SimpleObject("large", "blue", "box"),
            "LargeGreenBrick": new Types_1.SimpleObject("large", "green", "brick"),
            "LargeBlueCup": new Types_1.SimpleObject("large", "blue", "cup"),
            "LargeRedCup": new Types_1.SimpleObject("large", "red", "cup"),
            "SmallRedCup": new Types_1.SimpleObject("small", "red", "cup"),
            "SmallWhiteCup": new Types_1.SimpleObject("small", "white", "cup"),
            "SmallWhitePlank": new Types_1.SimpleObject("small", "white", "plank"),
            "SmallYellowPyramid": new Types_1.SimpleObject("small", "yellow", "pyramid"),
            "SmallYellowTable": new Types_1.SimpleObject("small", "yellow", "table"),
            "floor": new Types_1.SimpleObject(null, null, "floor")
        },
        "examples": [
            "put the large ball above a green object",
            "put all yellow things beside a box",
            "put a table behind all cups"
        ]
    };
    exports.ExampleWorlds["medium-3d"] = {
        "stacks": [
            [
                ["LrgWhtBall"],
                ["LrgGrnBrck2", "LrgRedBox"],
                [],
                ["LrgYlwBox", "LrgBluTble"],
                []
            ], [
                [],
                ["LrgYlwPrmd", "SmlRedTble", "SmlRedPrmd"],
                [],
                ["LrgBluBall"],
                []
            ], [
                [],
                ["LrgRedPlnk"],
                [],
                [],
                []
            ], [
                ["SmlGrnPlnk", "SmlBluBox", "SmlBlkBall"],
                ["LrgGrnBrck3", "SmlWhtBrck"],
                ["SmlBlkBox"],
                [],
                []
            ],
        ],
        "holding": "LrgGrnBrck1",
        "arm": [0, 0],
        "objects": {
            "LrgGrnBrck1": new Types_1.SimpleObject("large", "green", "brick"),
            "LrgGrnBrck2": new Types_1.SimpleObject("large", "green", "brick"),
            "LrgGrnBrck3": new Types_1.SimpleObject("large", "green", "brick"),
            "SmlWhtBrck": new Types_1.SimpleObject("small", "white", "brick"),
            "LrgRedPlnk": new Types_1.SimpleObject("large", "red", "plank"),
            "SmlGrnPlnk": new Types_1.SimpleObject("small", "green", "plank"),
            "LrgWhtBall": new Types_1.SimpleObject("large", "white", "ball"),
            "SmlBlkBall": new Types_1.SimpleObject("small", "black", "ball"),
            "LrgBluTble": new Types_1.SimpleObject("large", "blue", "table"),
            "SmlRedTble": new Types_1.SimpleObject("small", "red", "table"),
            "LrgYlwPrmd": new Types_1.SimpleObject("large", "yellow", "pyramid"),
            "SmlRedPrmd": new Types_1.SimpleObject("small", "red", "pyramid"),
            "LrgYlwBox": new Types_1.SimpleObject("large", "yellow", "box"),
            "LrgRedBox": new Types_1.SimpleObject("large", "red", "box"),
            "SmlBluBox": new Types_1.SimpleObject("small", "blue", "box"),
            "LrgBluBall": new Types_1.SimpleObject("large", "blue", "ball"),
            "SmlBlkBox": new Types_1.SimpleObject("small", "black", "box"),
            "floor": new Types_1.SimpleObject(null, null, "floor")
        },
        "examples": [
            "put the white ball in a box on the floor",
            "move a large ball inside a yellow box on the floor",
            "take a red object",
            "take the white ball",
            "put all boxes on the floor",
            "put the large plank under a green brick",
            "move all bricks on a table",
            "move all balls inside a large box",
            "put the box behind a box on a table",
            "move all planks in front of a blue table"
        ]
    };
});
