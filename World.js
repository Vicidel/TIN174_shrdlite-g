(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function world_object_counter(object, state) {
        for (var i in state.objects) {
            var obj1 = state.objects[i];
            if (obj1 == object)
                continue;
            if (obj1.form == object.form && obj1.color == object.color && obj1.size == object.size) {
                //console.log(`${obj1.toString()} and ${object.toString()}`)
                return 2; // no need to check if more than two similar objects
            }
        }
        return 1;
    }
    exports.world_object_counter = world_object_counter;
});
