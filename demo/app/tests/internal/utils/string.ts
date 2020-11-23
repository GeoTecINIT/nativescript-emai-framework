import { pascalCase } from "@geotecinit/emai-framework/internal/utils/string";

describe("String utils", () => {
    it("allows to turn a sentence into pascal case", () => {
        const sentence = "Start_DETECTING human-activity changes";
        const expected = "StartDetectingHumanActivityChanges";
        const result = pascalCase(sentence);
        expect(result).toEqual(expected);
    });
});
