import { ProgressPlugBrowser } from './lib/progressPlugBrowser.js';
import { ProgressPlugNode } from './lib/progressPlugNode.js';
export const progressPlugFactory = {
    get ProgressPlug() {
        if(typeof window === 'undefined') {
            return ProgressPlugNode;
        }
        return ProgressPlugBrowser;
    }
};
