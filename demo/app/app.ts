import * as app from "tns-core-modules/application";
import { emaiFramework } from "nativescript-emai-framework";
import { demoTaskGraph } from "~/tasks/graph";

emaiFramework.init([], demoTaskGraph, { enableLogging: true });

app.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
