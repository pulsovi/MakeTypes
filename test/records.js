"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./common/util");
var OptionalFieldProxy_1 = require("./generated/OptionalFieldProxy");
var FieldNamesProxy_1 = require("./generated/FieldNamesProxy");
var InvalidCharactersProxy_1 = require("./generated/InvalidCharactersProxy");
describe("Records", function () {
    it("Invalid Charachters fields", function () {
        var invalidChars = {
            normal: 1,
            "2d-canvas": 2,
            "forward-looking": 3,
            "space ": 4,
            "2-and-with-3-multiple-numbers and spaces": 5,
            "plus+": 6,
            "star*": 7,
            "slash/": 8,
            "minus-": 9,
            "colon:": 11,
            "question-mark?": 11,
            "some-object": {
                "with-yes-more": 12,
                fine: 13,
                "-more_wrong": 14
            }
        };
        (0, util_1.parseEquals)(InvalidCharactersProxy_1.InvalidCharactersProxy, JSON.stringify(invalidChars), invalidChars);
    });
    it("Optional fields", function () {
        var optfields = [{}, {
                foo: 3
            }, {
                bar: 3
            }, {
                foo: 3, bar: 4
            }];
        optfields.forEach(function (optfield) {
            (0, util_1.parseEquals)(OptionalFieldProxy_1.OptionalFieldProxy, JSON.stringify(optfield), optfield);
        });
        (0, util_1.parseThrows)(OptionalFieldProxy_1.OptionalFieldProxy, 'null');
    });
    it("Field names with underscores", function () {
        var optfields = [{
                "lower1": 3,
                "lower2": { "x": 3 },
                "Upper1": 4,
                "Upper2": { "y": 3 },
                "_lower1": 3,
                "_lower2": { "x2": 3 },
                "_Upper1": 4,
                "_Upper2": { "y2": 3 },
                "_underscore1": 5,
                "_underscore2": { "z": 5 },
                "TwoComponents1": 6,
                "TwoComponents2": { "v": 6 },
                "Underscore_Separates1": 7,
                "Underscore_Separates2": { "m": 7 },
                "_Underscore_Separates1": 7,
                "_Underscore_Separates2": { "m2": 7 },
                "_Underscore_prefix1": 8,
                "_Underscore_prefix2": { "n": 7 },
                "_Underscore_Prefix1": 8,
                "_Underscore_Prefix2": { "p": 7 },
                "_UnderscorePrefix1": 8,
                "_UnderscorePrefix2": { "q": 7 },
                "underscore_Separates1": 7,
                "underscore_Separates2": { "a": 7 },
                "_underscore_prefix1": 8,
                "_underscore_prefix2": { "b": 7 }
            }];
        optfields.forEach(function (optfield) {
            (0, util_1.parseEquals)(FieldNamesProxy_1.FieldNamesProxy, JSON.stringify(optfield), optfield);
        });
        (0, util_1.parseThrows)(FieldNamesProxy_1.FieldNamesProxy, 'null');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3Jkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlY29yZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBdUQ7QUFFdkQscUVBQWtFO0FBRWxFLCtEQUE0RDtBQUU1RCw2RUFBMEU7QUFFMUUsUUFBUSxDQUFDLFNBQVMsRUFBRTtJQUNsQixFQUFFLENBQUMsNEJBQTRCLEVBQUU7UUFDL0IsSUFBSSxZQUFZLEdBQXNCO1lBQ3BDLE1BQU0sRUFBRSxDQUFDO1lBQ1QsV0FBVyxFQUFFLENBQUM7WUFDZCxpQkFBaUIsRUFBRSxDQUFDO1lBQ3BCLFFBQVEsRUFBRSxDQUFDO1lBQ1gsMENBQTBDLEVBQUUsQ0FBQztZQUM3QyxPQUFPLEVBQUUsQ0FBQztZQUNWLE9BQU8sRUFBRSxDQUFDO1lBQ1YsUUFBUSxFQUFFLENBQUM7WUFDWCxRQUFRLEVBQUUsQ0FBQztZQUNYLFFBQVEsRUFBRSxFQUFFO1lBQ1osZ0JBQWdCLEVBQUUsRUFBRTtZQUNwQixhQUFhLEVBQUU7Z0JBQ2IsZUFBZSxFQUFFLEVBQUU7Z0JBQ25CLElBQUksRUFBRSxFQUFFO2dCQUNSLGFBQWEsRUFBRSxFQUFFO2FBQ2xCO1NBQ0YsQ0FBQztRQUNGLElBQUEsa0JBQVcsRUFBb0IsK0NBQXNCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNyRyxDQUFDLENBQUMsQ0FBQztJQUNILEVBQUUsQ0FBQyxpQkFBaUIsRUFBRTtRQUNwQixJQUFNLFNBQVMsR0FBb0IsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RDLEdBQUcsRUFBRSxDQUFDO2FBQ1AsRUFBRTtnQkFDRCxHQUFHLEVBQUUsQ0FBQzthQUNQLEVBQUU7Z0JBQ0QsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUNmLENBQUMsQ0FBQztRQUNILFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO1lBQ3pCLElBQUEsa0JBQVcsRUFBZ0IsdUNBQWtCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyRixDQUFDLENBQUMsQ0FBQztRQUNILElBQUEsa0JBQVcsRUFBQyx1Q0FBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsQ0FBQztJQUNILEVBQUUsQ0FBQyw4QkFBOEIsRUFBRTtRQUNqQyxJQUFNLFNBQVMsR0FBaUIsQ0FBQztnQkFDL0IsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFHLENBQUMsRUFBQztnQkFDcEIsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFHLENBQUMsRUFBQztnQkFDcEIsU0FBUyxFQUFFLENBQUM7Z0JBQ1osU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFHLENBQUMsRUFBQztnQkFDdEIsU0FBUyxFQUFFLENBQUM7Z0JBQ1osU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFHLENBQUMsRUFBQztnQkFDdEIsY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGNBQWMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7Z0JBQzFCLGdCQUFnQixFQUFFLENBQUM7Z0JBQ25CLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFHLENBQUMsRUFBRTtnQkFDN0IsdUJBQXVCLEVBQUUsQ0FBQztnQkFDMUIsdUJBQXVCLEVBQUUsRUFBRSxHQUFHLEVBQUcsQ0FBQyxFQUFDO2dCQUNuQyx3QkFBd0IsRUFBRSxDQUFDO2dCQUMzQix3QkFBd0IsRUFBRSxFQUFFLElBQUksRUFBRyxDQUFDLEVBQUM7Z0JBQ3JDLHFCQUFxQixFQUFHLENBQUM7Z0JBQ3pCLHFCQUFxQixFQUFHLEVBQUUsR0FBRyxFQUFHLENBQUMsRUFBQztnQkFDbEMscUJBQXFCLEVBQUcsQ0FBQztnQkFDekIscUJBQXFCLEVBQUcsRUFBRSxHQUFHLEVBQUcsQ0FBQyxFQUFDO2dCQUNsQyxvQkFBb0IsRUFBRyxDQUFDO2dCQUN4QixvQkFBb0IsRUFBRyxFQUFFLEdBQUcsRUFBRyxDQUFDLEVBQUM7Z0JBQ2pDLHVCQUF1QixFQUFFLENBQUM7Z0JBQzFCLHVCQUF1QixFQUFFLEVBQUUsR0FBRyxFQUFHLENBQUMsRUFBQztnQkFDbkMscUJBQXFCLEVBQUcsQ0FBQztnQkFDekIscUJBQXFCLEVBQUcsRUFBRSxHQUFHLEVBQUcsQ0FBQyxFQUFDO2FBQ25DLENBQUMsQ0FBQztRQUNILFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO1lBQ3pCLElBQUEsa0JBQVcsRUFBYSxpQ0FBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFBLGtCQUFXLEVBQUMsaUNBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIn0=