import { Id } from "../../../types/d2-api";
import { ExportBuilder } from "../../../types/synchronization";
import { debug } from "../../../utils/debug";
import { hashString } from "../../../utils/hash";

export interface BuilderRegistryConfig {
    debug?: boolean;
}

/**
 * Registry to keep track of metadata operations already done by `MetadataPayloadBuilder`.
 *
 * Each key represents a `builder` context,
 * and stores a list of IDs already processed for that context.
 *
 * This ensures that the same ID can be processed again if the builder context changes,
 * since the outcome may differ based on the builder parameters.
 */
export class BuilderRegistry {
    private cache = new Map<string, Set<Id>>();
    private config: BuilderRegistryConfig;

    constructor(config: BuilderRegistryConfig = {}) {
        this.config = { debug: false, ...config };
    }

    /** Creates a key based on builder params */
    private getCacheKey(builder: ExportBuilder): string {
        const contextFlags = [
            builder.type,
            builder.includeSharingSettingsObjectsAndReferences ? "sharing" : "",
            builder.includeUsersObjectsAndReferences ? "users" : "",
            builder.includeOrgUnitsObjectsAndReferences ? "orgunits" : "",
            builder.includeOnlySharingSettingsReferences ? "sharing-refs-only" : "",
            builder.includeOnlyUsersReferences ? "users-refs-only" : "",
            builder.includeOnlyOrgUnitsReferences ? "orgunits-refs-only" : "",
        ]
            .filter(Boolean)
            .join("|");

        const includeRulesHash = this.hashRules(builder.includeReferencesAndObjectsRules || []);
        const excludeRulesHash = this.hashRules(builder.excludeRules || []);

        return `${contextFlags}|inc:${includeRulesHash}|exc:${excludeRulesHash}`;
    }

    /** Create a consistent hash for the rules */
    private hashRules(rules: string[][]): string {
        // first element must be kept first because it is the key
        const sortedRules = rules
            .map(([ruleKey, ...ruleProps]) => [ruleKey, ruleProps.sort()].join("."))
            .sort()
            .join(",");
        return hashString(sortedRules);
    }

    private getOrCreateSet(builder: ExportBuilder): Set<Id> {
        const cacheKey = this.getCacheKey(builder);
        if (!this.cache.has(cacheKey)) {
            this.cache.set(cacheKey, new Set<Id>());
        }
        return this.cache.get(cacheKey) as Set<Id>;
    }

    public has(builder: ExportBuilder, id: Id): boolean {
        const set = this.getOrCreateSet(builder);
        return set.has(id);
    }

    public add(builder: ExportBuilder, id: Id): void {
        const set = this.getOrCreateSet(builder);
        set.add(id);
    }

    public addList(builder: ExportBuilder, ids: Id[]): void {
        const set = this.getOrCreateSet(builder);
        ids.forEach(id => set.add(id));
    }

    public filterNotRequested(builder: ExportBuilder, ids: Id[]): Id[] {
        const set = this.getOrCreateSet(builder);
        const notRequested = ids.filter(id => !set.has(id));

        if (this.config.debug && notRequested.length < ids.length) {
            const cacheKey = this.getCacheKey(builder);
            debug(`${ids.length - notRequested.length}/${ids.length} IDs already cached for context: ${cacheKey}`);
        }

        return notRequested;
    }

    public clear(): void {
        if (this.config.debug) {
            const stats = this.getStats();
            debug(
                `Clearing BuilderRegistry: ${stats.totalKeys} contexts, ${stats.totalIds} total cached IDs, ${stats.repeatedIds} IDs repeated across contexts`
            );
        }
        this.cache.clear();
    }

    public getStats(): { totalKeys: number; totalIds: number; repeatedIds: number } {
        let totalIds = 0;
        const allIds = new Map<Id, number>();

        this.cache.forEach(set => {
            totalIds += set.size;
            set.forEach(id => {
                allIds.set(id, (allIds.get(id) || 0) + 1);
            });
        });

        let repeatedIds = 0;
        allIds.forEach(count => {
            if (count > 1) {
                repeatedIds++;
            }
        });

        return {
            totalKeys: this.cache.size,
            totalIds,
            repeatedIds,
        };
    }
}
