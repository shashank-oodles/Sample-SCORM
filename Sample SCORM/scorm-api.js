// SCORM API Wrapper
class SCORMAdapter {
    constructor() {
        this.apiHandle = null;
        this.findAPI();
    }

    findAPI() {
        let api = null;
        
        // Check current window
        if (window.API_1484_11) {
            api = window.API_1484_11;
        } else if (window.API) {
            api = window.API;
        }
        
        // Check parent windows
        if (!api && window.parent) {
            try {
                let parent = window.parent;
                while (parent && parent !== window && !api) {
                    if (parent.API_1484_11) {
                        api = parent.API_1484_11;
                    } else if (parent.API) {
                        api = parent.API;
                    }
                    parent = parent.parent;
                }
            } catch (e) {
                // Cross-origin access blocked - continue without parent API
            }
        }
        
        // Check opener window
        if (!api && window.opener) {
            try {
                if (window.opener.API_1484_11) {
                    api = window.opener.API_1484_11;
                } else if (window.opener.API) {
                    api = window.opener.API;
                }
            } catch (e) {
                // Cross-origin access blocked - continue without opener API
            }
        }
        
        this.apiHandle = api;
        return api !== null;
    }

    initialize() {
        if (!this.apiHandle) {
            console.log('SCORM API not found - running in standalone mode');
            return false;
        }
        
        try {
            const result = this.apiHandle.Initialize('');
            if (result === 'true') {
                console.log('SCORM API initialized successfully');
                return true;
            } else {
                console.error('SCORM initialization failed:', this.getLastError());
                return false;
            }
        } catch (e) {
            console.error('SCORM initialization error:', e);
            return false;
        }
    }

    terminate() {
        if (!this.apiHandle) return false;
        
        try {
            const result = this.apiHandle.Terminate('');
            return result === 'true';
        } catch (e) {
            console.error('SCORM termination error:', e);
            return false;
        }
    }

    getValue(parameter) {
        if (!this.apiHandle) return '';
        
        try {
            return this.apiHandle.GetValue(parameter);
        } catch (e) {
            console.error('SCORM GetValue error:', e);
            return '';
        }
    }

    setValue(parameter, value) {
        if (!this.apiHandle) return false;
        
        try {
            const result = this.apiHandle.SetValue(parameter, value);
            return result === 'true';
        } catch (e) {
            console.error('SCORM SetValue error:', e);
            return false;
        }
    }

    commit() {
        if (!this.apiHandle) return false;
        
        try {
            const result = this.apiHandle.Commit('');
            return result === 'true';
        } catch (e) {
            console.error('SCORM Commit error:', e);
            return false;
        }
    }

    getLastError() {
        if (!this.apiHandle) return '0';
        
        try {
            return this.apiHandle.GetLastError();
        } catch (e) {
            console.error('SCORM GetLastError error:', e);
            return '0';
        }
    }

    getErrorString(errorCode) {
        if (!this.apiHandle) return '';
        
        try {
            return this.apiHandle.GetErrorString(errorCode);
        } catch (e) {
            console.error('SCORM GetErrorString error:', e);
            return '';
        }
    }

    setCompletionStatus(status) {
        return this.setValue('cmi.completion_status', status);
    }

    setSuccessStatus(status) {
        return this.setValue('cmi.success_status', status);
    }

    setScore(score, min = 0, max = 100) {
        const success = this.setValue('cmi.score.raw', score.toString()) &&
                       this.setValue('cmi.score.min', min.toString()) &&
                       this.setValue('cmi.score.max', max.toString());
        return success;
    }

    setSessionTime(milliseconds) {
        // Convert milliseconds to ISO 8601 duration format
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const duration = `PT${hours}H${minutes % 60}M${seconds % 60}S`;
        return this.setValue('cmi.session_time', duration);
    }
}

// Global SCORM instance
window.scorm = new SCORMAdapter();