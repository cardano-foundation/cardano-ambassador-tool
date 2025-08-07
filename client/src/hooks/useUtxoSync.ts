// src/hooks/useUtxoSync.ts
import { useEffect, useRef } from "react";

type SyncContext =
    | "member"
    | "membership_intent"
    | "proposal"
    | "proposal_intent"
    | "sign_of_approval";

export function useUtxoSync() {
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const worker = new Worker("/db-worker.js");

        workerRef.current = worker;

        return () => {
            worker.terminate();
        };
    }, []);

    function syncAllData() {
        if (!workerRef.current) return;

        workerRef.current.postMessage({
            action: "seedAll",
            apiBaseUrl: window.location.origin,
            contexts: [
                "member",
                "membership_intent",
                "proposal",
                "proposal_intent",
                "sign_of_approval",
            ],
        });
    }

    function syncData(context: SyncContext) {
        if (!workerRef.current) return;

        workerRef.current.postMessage({
            action: "seed",
            apiBaseUrl: window.location.origin,
            context,
        });
    }

    return {
        syncAllData,
        syncData,
    };
}