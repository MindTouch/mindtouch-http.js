import { ProgressPlugBrowser } from './progressPlugBrowser.js';
import { ProgressPlugNode } from './progressPlugNode.js';
export const progressPlugFactory = {
    get ProgressPlug() {
        if(typeof window === 'undefined') {
            return ProgressPlugNode;
        }
        return ProgressPlugBrowser;
    }
};
