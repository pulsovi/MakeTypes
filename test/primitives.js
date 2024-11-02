"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./common/util");
var NumberProxy_1 = require("./generated/NumberProxy");
var NumbersProxy_1 = require("./generated/NumbersProxy");
var StringProxy_1 = require("./generated/StringProxy");
var StringsProxy_1 = require("./generated/StringsProxy");
var BooleanProxy_1 = require("./generated/BooleanProxy");
var BooleansProxy_1 = require("./generated/BooleansProxy");
var NullProxy_1 = require("./generated/NullProxy");
var NullsProxy_1 = require("./generated/NullsProxy");
var MaybeNumberProxy_1 = require("./generated/MaybeNumberProxy");
var BooleanOrStringProxy_1 = require("./generated/BooleanOrStringProxy");
describe('Primitive Types', function () {
    it('Number', function () {
        [NumberProxy_1.NumberProxy, NumbersProxy_1.NumbersProxy].forEach(function (proxy) {
            (0, util_1.parseEquals)(proxy, '3', 3);
            (0, util_1.parseThrows)(proxy, '"hello"');
            (0, util_1.parseThrows)(proxy, '[]');
            (0, util_1.parseThrows)(proxy, '[3]');
            (0, util_1.parseThrows)(proxy, "null");
        });
        {
            var n = 3;
            var m = n;
            var m2 = n;
            var n2 = m;
            n2 = m2;
        }
    });
    it('String', function () {
        [StringProxy_1.StringProxy, StringsProxy_1.StringsProxy].forEach(function (proxy) {
            (0, util_1.parseEquals)(proxy, "\"hello\"", "hello");
            (0, util_1.parseThrows)(proxy, "3");
            (0, util_1.parseThrows)(proxy, '[]');
            (0, util_1.parseThrows)(proxy, "null");
        });
        {
            var s = "hello";
            var m = s;
            var m2 = s;
            var s2 = m;
            s2 = m2;
        }
    });
    it('Boolean', function () {
        [BooleanProxy_1.BooleanProxy, BooleansProxy_1.BooleansProxy].forEach(function (proxy) {
            (0, util_1.parseEquals)(proxy, "true", true);
            (0, util_1.parseEquals)(proxy, "false", false);
            (0, util_1.parseThrows)(proxy, "\"true\"");
            (0, util_1.parseThrows)(proxy, "[]");
            (0, util_1.parseThrows)(proxy, "null");
        });
        {
            var b = true;
            var m = b;
            var m2 = b;
            var b2 = m;
            b2 = m2;
        }
    });
    it('Null', function () {
        [NullProxy_1.NullProxy, NullsProxy_1.NullsProxy].forEach(function (proxy) {
            (0, util_1.parseEquals)(proxy, "null", null);
            (0, util_1.parseThrows)(proxy, "\"null\"");
            (0, util_1.parseThrows)(proxy, "[]");
            (0, util_1.parseThrows)(proxy, "3");
        });
        {
            var n = null;
            var m = n;
            var m2 = n;
            var n2 = m;
            n2 = m2;
        }
    });
    it('Optional number', function () {
        (0, util_1.parseEquals)(MaybeNumberProxy_1.MaybeNumberProxy, "null", null);
        (0, util_1.parseEquals)(MaybeNumberProxy_1.MaybeNumberProxy, "3", 3);
        (0, util_1.parseThrows)(MaybeNumberProxy_1.MaybeNumberProxy, "[]");
        (0, util_1.parseThrows)(MaybeNumberProxy_1.MaybeNumberProxy, "\"hello\"");
        var n = 3;
        var m = n;
        m = null;
    });
    it("Boolean or string", function () {
        (0, util_1.parseEquals)(BooleanOrStringProxy_1.BooleanOrStringProxy, "true", true);
        (0, util_1.parseEquals)(BooleanOrStringProxy_1.BooleanOrStringProxy, "\"hello\"", "hello");
        (0, util_1.parseThrows)(BooleanOrStringProxy_1.BooleanOrStringProxy, '[]');
        var b = true;
        var s = "hello";
        var bs = b;
        bs = s;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByaW1pdGl2ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBdUQ7QUFDdkQsdURBQW9EO0FBQ3BELHlEQUFzRDtBQUd0RCx1REFBb0Q7QUFFcEQseURBQXNEO0FBRXRELHlEQUFzRDtBQUN0RCwyREFBd0Q7QUFHeEQsbURBQWdEO0FBQ2hELHFEQUFrRDtBQUdsRCxpRUFBOEQ7QUFFOUQseUVBQXNFO0FBR3RFLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtJQUMxQixFQUFFLENBQUMsUUFBUSxFQUFFO1FBQ1gsQ0FBQyx5QkFBVyxFQUFFLDJCQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLO1lBQ3hDLElBQUEsa0JBQVcsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUEsa0JBQVcsRUFBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDOUIsSUFBQSxrQkFBVyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6QixJQUFBLGtCQUFXLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFCLElBQUEsa0JBQVcsRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxDQUFDO1lBQ0MsSUFBTSxDQUFDLEdBQVcsQ0FBQyxDQUFDO1lBQ3BCLElBQU0sQ0FBQyxHQUFXLENBQUMsQ0FBQztZQUNwQixJQUFNLEVBQUUsR0FBWSxDQUFDLENBQUM7WUFDdEIsSUFBSSxFQUFFLEdBQVcsQ0FBQyxDQUFDO1lBQ25CLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDVixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsUUFBUSxFQUFFO1FBQ1gsQ0FBQyx5QkFBVyxFQUFFLDJCQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLO1lBQ3hD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