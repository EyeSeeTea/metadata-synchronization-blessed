export type EmergencyType = "efh" | "ebola";

export interface EmergencyResponseConfig {
    program: Code;
    syncRules: { metadata: Code[]; data: Code[] };
}

type Code = string;

const emergencyResponseConfig: Record<EmergencyType, EmergencyResponseConfig> = {
    efh: {
        program: "EFH_GENERAL_INTAKE_FORM",
        syncRules: {
            metadata: [
                "EFH_METADATA_ORGUNITS",
                "EFH_METADATA_USER_ROLES",
                "EFH_METADATA_NO_PROGRAM_RULES",
                "EFH_METADATA",
            ],
            data: ["EFH_DATA"],
        },
    },
    ebola: {
        program: "EBOLA_GENERAL_INTAKE_FORM",
        syncRules: { metadata: ["EBOLA_METADATA"], data: ["EBOLA_DATA"] },
    },
};

export function getEmergencyResponseConfig(emergencyType: EmergencyType): EmergencyResponseConfig {
    return emergencyResponseConfig[emergencyType];
}
