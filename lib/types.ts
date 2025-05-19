import { AnyShape } from "./classes/AnyShape.js";
import { BooleanShape } from "./classes/BooleanShape.js";
import { BottomShape } from "./classes/BottomShape.js";
import { CollectionShape } from "./classes/CollectionShape.js";
import { NullShape } from "./classes/NullShape.js";
import { NumberShape } from "./classes/NumberShape.js";
import { RecordShape } from "./classes/RecordShape.js";
import { StringShape } from "./classes/StringShape.js";

export type ShapeInstance = AnyShape | BooleanShape | BottomShape | CollectionShape | NullShape | NumberShape | RecordShape | StringShape;
