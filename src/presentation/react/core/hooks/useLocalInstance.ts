import { useEffect, useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { useAppContext } from "../contexts/AppContext";

export function useLocalInstance(): { localInstance: Instance | undefined; error: boolean } {
    const { compositionRoot } = useAppContext();
    const [localInstance, setLocalInstance] = useState<Instance>();
    const [error, setError] = useState(false);

    useEffect(() => {
        compositionRoot.instances.getById("LOCAL").then(result => {
            result.match({
                success: instance => setLocalInstance(instance),
                error: () => setError(true),
            });
        });
    }, [compositionRoot]);

    return { localInstance, error };
}
