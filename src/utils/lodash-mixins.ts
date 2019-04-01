import _ from "lodash";

declare module "lodash" {
    interface LoDashStatic {
        deepMerge(obj: any, ...src: any): any;
    }
}

function deepMerge(obj: any, ...src: any): any {
    const mergeCustomizer = (obj: any, src: any): any => (_.isArray(obj) ? obj.concat(src) : src);
    return _.mergeWith(obj, ...src, mergeCustomizer);
}

_.mixin({ deepMerge });
