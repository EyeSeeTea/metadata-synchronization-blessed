import MetadataSyncRuleDetailPageObject from "../support/page-objects/MetadataSyncRuleDetailPageObject";

context("Edit Metadata sync rule", function() {
    const page = new MetadataSyncRuleDetailPageObject(cy);

    it("should have the correct title", () => {
        const rule = givenAnExistedSyncRule();
        page.open(rule.id).assertTitle(title =>
            title.contains("Edit metadata synchronization rule")
        );
    });

    it("should have the correct general info", () => {
        const rule = givenAnExistedSyncRule();
        page.open(rule.id)
            .assertName(name => name.should("have.value", rule.name))
            .assertCode(name => name.should("have.value", rule.code))
            .assertDescription(name => name.should("have.value", rule.description));
    });

    it("should have the correct selected metadata", () => {
        const rule = givenAnExistedSyncRule();
        page.open(rule.id)
            .next()
            .checkOnlySelectedItems()
            .assertSelectedMetadata(selectedMetadata => {
                selectedMetadata.contains(
                    `There are ${rule.builder.metadataIds.length} items selected in all pages.`
                );
            });
    });

    it("should have the correct selected instances", () => {
        const rule = givenAnExistedSyncRule();
        page.open(rule.id)
            .next()
            .next()
            .next()
            .assertSelectedInstances(selectedInstances =>
                selectedInstances.select(rule.builder.targetInstances[0])
            );
    });
});

function givenAnExistedSyncRule() {
    const syncRule = {
        id: "JpEdpYwekbS",
        name: "Metadata sync rule name",
        code: "Metadata sync rule code",
        created: "2020-02-26T08:43:11.739Z",
        description: "Metadata sync rule description",
        builder: {
            targetInstances: ["Y5QsHDoD4I0"],
            metadataIds: ["t0ml4ZZpnu0"],
            excludedIds: [],
            dataParams: {
                strategy: "NEW_AND_UPDATES",
                allAttributeCategoryOptions: true,
                dryRun: false,
            },
            syncParams: {
                importStrategy: "CREATE_AND_UPDATE",
                includeSharingSettings: true,
                useDefaultIncludeExclude: true,
                atomicMode: "ALL",
                mergeMode: "MERGE",
                importMode: "COMMIT",
                metadataIncludeExcludeRules: {},
            },
        },
        enabled: false,
        lastUpdated: "2020-02-26T11:22:28.626Z",
        lastUpdatedBy: {
            id: "M5zQapPyTZI",
            name: "admin admin",
        },
        publicAccess: "rw------",
        user: {
            id: "M5zQapPyTZI",
            name: "admin admin",
        },
        userAccesses: [],
        userGroupAccesses: [],
        type: "metadata",
    };

    cy.server();
    cy.route({
        method: "GET",
        url: `api/dataStore/metadata-synchronization/rules`,
        response: [syncRule],
    }).as("getSyncRules");

    return syncRule;
}
