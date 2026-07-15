import { WmrProvider } from "./context/WmrProvider";
import { WmrWizard } from "./WmrWizard";

export type WmrPageProps = {};

export function WmrPage() {
    return (
        <WmrProvider>
            <WmrWizard />
        </WmrProvider>
    );
}
