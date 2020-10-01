import { EventData } from "tns-core-modules/data/observable";
import { View } from "tns-core-modules/ui/core/view";

export function closeModal(args: EventData) {
    const view: View = <View>args.object;
    view.closeModal();
}
