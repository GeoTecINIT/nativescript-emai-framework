import { Application } from "@nativescript/core";
import { emaiFramework } from "@geotecinit/emai-framework";
import { demoTaskGraph } from "~/tasks/graph";

emaiFramework
    .init([], demoTaskGraph, {
        enableLogging: true,
        notificationsChannelName: "Intervention alerts",
    })
    .then(() => console.log("EMA/I framework successfully loaded"))
    .catch((err) => {
        console.error(
            `Could not load EMA/I framework: ${err.stack ? err.stack : err}`
        );
    });

Application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
