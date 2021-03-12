import { jsonDateReplacer } from "@geotecinit/emai-framework/internal/utils/date";

describe("Date utils", function () {
    it("jsonDateReplacer allows to stringify a date with timestamp and timezone offset format", () => {
        const date = new Date();
        const timestamp = date.getTime();
        const offset = date.getTimezoneOffset();
        const objectToStringify = {
            attribute1: "someString",
            date1: date,
            attribute2: 53,
            attribute3: {
                date: date.toJSON()
            }
        }

        const stringifiedObject = JSON.stringify(objectToStringify, jsonDateReplacer);
        const expectedString = `{"attribute1":"someString","date1":{"value":${timestamp},"offset":${offset}},"attribute2":53,"attribute3":{"date":{"value":${timestamp},"offset":${offset}}}}`;

        expect(stringifiedObject).toEqual(expectedString);
    })
});
