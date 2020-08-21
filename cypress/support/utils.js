export const dataTest = (name, filter) => `[data-test="${name}"] ${filter ? filter : ""}`.trim();

export const syncRuleFixture = (syncRuleType, routeName = "getRules", action) => {
    return cy.fixture(`${syncRuleType}-sync-rules.json`).then(syncRules => {
        cy.fixture(`${syncRuleType}-sync-rule.json`).then(syncRuleBuilder => {
            const completedSyncRules = syncRules.map(syncRule => {
                return { ...syncRule, builder: syncRuleBuilder.builder };
            });

            cy.server();
            cy.route({
                method: "GET",
                url: `api/dataStore/metadata-synchronization/rules`,
                response: completedSyncRules,
            }).as(routeName);
            for (const { id } of syncRules) {
                cy.route({
                    method: "GET",
                    url: `api/dataStore/metadata-synchronization/rules-${id}`,
                    response: syncRuleBuilder,
                });
            }

            action(completedSyncRules);
        });
    });
};
