"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./common/util");
var PrimitiveArrayProxy_1 = require("./generated/PrimitiveArrayProxy");
var EmptyArrayProxy_1 = require("./generated/EmptyArrayProxy");
var MixedArrayProxy_1 = require("./generated/MixedArrayProxy");
var MixedArray2Proxy_1 = require("./generated/MixedArray2Proxy");
describe("Collections", function () {
    it("Empty arrays", function () {
        var eas = [null, [], [null]];
        eas.forEach(function (ea) { return (0, util_1.parseEquals)(EmptyArrayProxy_1.EmptyArrayProxy, JSON.stringify(ea), ea); });
        (0, util_1.parseThrows)(EmptyArrayProxy_1.EmptyArrayProxy, JSON.stringify([2]));
    });
    it("Numerical arrays", function () {
        var nas = [null, [1], []];
        nas.forEach(function (na) { return (0, util_1.parseEquals)(PrimitiveArrayProxy_1.PrimitiveArrayProxy, JSON.stringify(na), na); });
    });
    it("Mixed type arrays", function () {
        var mta = [
            null,
            [1, 2, 3],
            [true, false],
            [true, 1, false],
            [{ foo: 3 }]
        ];
        var mta2 = mta;
        [MixedArrayProxy_1.MixedArrayProxy, MixedArray2Proxy_1.MixedArray2Proxy].forEach(function (proxy) {
            mta2.forEach(function (mta) {
                (0, util_1.parseEquals)(proxy, JSON.stringify(mta), mta);
            });
            (0, util_1.parseThrows)(proxy, JSON.stringify(["hello"]));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb2xsZWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUF1RDtBQUV2RCx1RUFBb0U7QUFFcEUsK0RBQTREO0FBRTVELCtEQUE0RDtBQUU1RCxpRUFBOEQ7QUFFOUQsUUFBUSxDQUFDLGFBQWEsRUFBRTtJQUN0QixFQUFFLENBQUMsY0FBYyxFQUFFO1FBQ2pCLElBQU0sR0FBRyxHQUFpQixDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFLElBQUssT0FBQSxJQUFBLGtCQUFXLEVBQWEsaUNBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFoRSxDQUFnRSxDQUFDLENBQUM7UUFDdEYsSUFBQSxrQkFBVyxFQUFDLGlDQUFlLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRCxDQUFDLENBQUMsQ0FBQztJQUNILEVBQUUsQ0FBQyxrQkFBa0IsRUFBRTtRQUNyQixJQUFNLEdBQUcsR0FBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBRSxJQUFLLE9BQUEsSUFBQSxrQkFBVyxFQUFpQix5Q0FBbUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUF4RSxDQUF3RSxDQUFDLENBQUM7SUFDaEcsQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMsbUJBQW1CLEVBQUU7UUFDdEIsSUFBTSxHQUFHLEdBQWlCO1lBQ3hCLElBQUk7WUFDSixDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO1lBQ2IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQztZQUNoQixDQUFDLEVBQUMsR0FBRyxFQUFFLENBQUMsRUFBQyxDQUFDO1NBQ1gsQ0FBQztRQUNGLElBQU0sSUFBSSxHQUFrQixHQUFHLENBQUM7UUFDaEMsQ0FBQyxpQ0FBZSxFQUFFLG1DQUFnQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztZQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRztnQkFDZixJQUFBLGtCQUFXLEVBQWEsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFBLGtCQUFXLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIn0=