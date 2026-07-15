import _ from "lodash";

type Row = { id: string };

export type DataStoreSelectionParams = {
    included: string[];
    newlySelectedIds: string[];
    newlyUnselectedIds: string[];
    excludedIds: string[];
    rows: Row[];
    parseChildren: (ids: string[]) => string[];
};

export type DataStoreSelectionResult = {
    included: string[];
    excluded: string[];
};

export function computeDataStoreSelection(params: DataStoreSelectionParams): DataStoreSelectionResult {
    const { included, newlySelectedIds, newlyUnselectedIds, excludedIds, rows, parseChildren } = params;

    const hasChildren = (id: string) => parseChildren([id]).length > 0;

    const parentsSelected = newlySelectedIds.filter(hasChildren);
    const parentsUnselected = newlyUnselectedIds.filter(hasChildren);
    const childrenUnselected = newlyUnselectedIds.filter(id => !hasChildren(id));

    const removedByParentUnselect = _(parentsUnselected).union(parseChildren(parentsUnselected)).value();

    const includedAfterPropagation = propagateNamespaceSelection(
        included,
        parseChildren(parentsSelected),
        removedByParentUnselect
    );

    const affectedParents = findAffectedParents(rows, newlySelectedIds, newlyUnselectedIds, parseChildren);

    const includedFinal = recomputeNamespaceParents(affectedParents, includedAfterPropagation, parseChildren);

    const excludedBase = _(excludedIds)
        .union(childrenUnselected)
        .difference(includedFinal)
        .difference(removedByParentUnselect)
        .difference(parseChildren(parentsSelected))
        .filter(id => !_.find(rows, { id }))
        .value();

    const parentsForcedUnselected = affectedParents.filter(p => !includedFinal.includes(p));
    const excludedFinal = _.difference(excludedBase, parentsForcedUnselected);

    return { included: includedFinal, excluded: excludedFinal };
}

function propagateNamespaceSelection(
    included: string[],
    childrenOfSelected: string[],
    removedByParentUnselect: string[]
): string[] {
    return _([included, childrenOfSelected]).flatten().uniq().difference(removedByParentUnselect).value();
}

function findAffectedParents(
    rows: Row[],
    newlySelectedIds: string[],
    newlyUnselectedIds: string[],
    parseChildren: (ids: string[]) => string[]
): string[] {
    const hasChildren = (id: string) => parseChildren([id]).length > 0;

    return _(rows)
        .filter(r => hasChildren(r.id))
        .filter(r => {
            const kids = parseChildren([r.id]);
            return (
                _.intersection(kids, newlySelectedIds).length > 0 || _.intersection(kids, newlyUnselectedIds).length > 0
            );
        })
        .map(r => r.id)
        .value();
}

function recomputeNamespaceParents(
    affectedParents: string[],
    includedAfterPropagation: string[],
    parseChildren: (ids: string[]) => string[]
): string[] {
    return affectedParents.reduce((accIncluded, parentId) => {
        const kids = parseChildren([parentId]);
        const selectedKids = _.intersection(kids, accIncluded);

        return kids.length > 0 && selectedKids.length === kids.length
            ? _.union(accIncluded, [parentId])
            : _.difference(accIncluded, [parentId]);
    }, includedAfterPropagation);
}
