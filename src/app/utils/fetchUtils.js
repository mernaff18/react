import { ERR_LOGIN_REQUIRED, NETWORK_CALL_TIMEOUT } from '../constants/appConstants';
import { logoutUser } from 'app/modules/authed';
import Auth from 'app/utils/Auth';
import Logger from 'app/utils/Logger';
import { push } from 'connected-react-router';
import humps from 'humps';

export function checkStatus(response) {
    const { status, statusText } = response;
    if (status >= 200 && status < 300) return response;
    const error = new Error(statusText);
    error.response = response;
    if (status >= 500) {
        Logger.logException(error);
    }
    throw error;
}

export function handleErrorV2(dispatch, ex, defaultMsg = 'Please try again...') {
    const { error = null } = ex || {};
    const status = ex && ex.response && ex.response.status;
    if (status === undefined) {
        defaultMsg = 'cancelled';
    }
    if (error === ERR_LOGIN_REQUIRED) {
        window.location.href = `${process.env.REACT_APP_MP_HOST}/login?nextUrl=${window.location.href}`;
        dispatch(logoutUser());
    }
    if (typeof dispatch === 'function') {
        if (status === 401) {
            return parseJSON(ex.response).then((d) => {
                if (d.error && d.error.message === 'Invalid MFA token') {
                    Auth.removeMfaToken();
                    window.location.href = `${process.env.REACT_APP_MP_HOST}/otp?nextUrl=${window.location.href}`;
                    return Promise.resolve('Invalid MFA Token');
                }
                dispatch(logoutUser());
                window.location.href = `${process.env.REACT_APP_MP_HOST}/login?nextUrl=${window.location.href}`;
                return Promise.resolve('Please re-login to try again');
            });
        }
        if (status === 403) {
            dispatch(push('/forbidden'));
            return Promise.resolve("You don't seem to have access to this part of the app");
        }
    }
    return handleError(ex, defaultMsg);
}

export function handleError(ex, defaultMsg = 'Please try again...') {
    return new Promise((resolve) => {
        if (!ex.response) {
            resolve(defaultMsg);
        }

        ex.response
            .json()
            .then((data) => {
                const { message } = data.error || data.message || defaultMsg;
                if (typeof message === 'string') {
                    resolve(message);
                }
                resolve(defaultMsg);
            })
            .catch((e) => {
                Logger.logException(e);
            });
    });
}

export function parseJSON(response) {
    return response && response.json();
}

export function parseBlob(response) {
    return response && response.blob();
}

export function setMultiPartPost(body) {
    const accessToken = Auth.getAccessToken();
    const mfaToken = Auth.getMFAToken();
    const roleHeaders = getGroupHeaders();
    const h = {};
    if (accessToken) {
        h.Authorization = `Bearer ${accessToken}`;
        h['Mfa-Token'] = mfaToken;
    }
    return {
        method: 'POST',
        headers: { ...h, ...roleHeaders },
        body,
    };
}

function setHeaders(body, isJsonBody = true) {
    const accessToken = Auth.getAccessToken();
    const mfaToken = Auth.getMFAToken();
    const roleHeaders = getGroupHeaders();
    const h = {};
    h.Accept = 'application/json';
    h['Content-Type'] = 'application/json';
    if (accessToken) {
        h.Authorization = `Bearer ${accessToken}`;
        h['Mfa-Token'] = mfaToken;
    }
    if (!body) {
        return {
            headers: h,
        };
    }
    return {
        headers: { ...h, ...roleHeaders },
        body: isJsonBody ? JSON.stringify(body) : body,
    };
}

export function setPostHeaders(body, isJsonBody = true) {
    const accessToken = Auth.getAccessToken();
    const mfaToken = Auth.getMFAToken();
    const roleHeaders = getGroupHeaders();
    const h = {};
    h.Accept = 'application/json';
    h['Content-Type'] = 'application/json';
    if (accessToken) {
        h.Authorization = `Bearer ${accessToken}`;
        h['Mfa-Token'] = mfaToken;
    }
    return {
        method: 'POST',
        headers: { ...h, ...roleHeaders },
        body: isJsonBody ? JSON.stringify(body) : body,
    };
}

export function setGetHeaders() {
    const accessToken = Auth.getAccessToken();
    const mfaToken = Auth.getMFAToken();
    const roleHeaders = getGroupHeaders();
    const h = {};
    h.Accept = 'application/json';
    h['Content-Type'] = 'application/json';
    if (accessToken) {
        h.Authorization = `Bearer ${accessToken}`;
        h['Mfa-Token'] = mfaToken;
    }
    return {
        method: 'GET',
        headers: { ...h, ...roleHeaders },
    };
}

export function setPutHeaders(body, isJsonBody = true) {
    const accessToken = Auth.getAccessToken();
    const mfaToken = Auth.getMFAToken();
    const roleHeaders = getGroupHeaders();
    const h = {};
    h.Accept = 'application/json';
    h['Content-Type'] = 'application/json';
    if (accessToken) {
        h.Authorization = `Bearer ${accessToken}`;
        h['Mfa-Token'] = mfaToken;
    }
    return {
        method: 'PUT',
        headers: { ...h, ...roleHeaders },
        body: isJsonBody ? JSON.stringify(body) : body,
    };
}

export function setPatchHeaders(body, isJsonBody = true) {
    const headers = setHeaders(body, isJsonBody);
    return {
        ...headers,
        method: 'PATCH',
    };
}
export function setDeleteHeaders(body, isJsonBody = true) {
    const accessToken = Auth.getAccessToken();
    const mfaToken = Auth.getMFAToken();
    const roleHeaders = getGroupHeaders();
    const h = {};
    h.Accept = 'application/json';
    h['Content-Type'] = 'application/json';
    if (accessToken) {
        h.Authorization = `Bearer ${accessToken}`;
        h['Mfa-Token'] = mfaToken;
    }
    return {
        method: 'DELETE',
        headers: { ...h, ...roleHeaders },
        body: isJsonBody ? JSON.stringify(body) : body,
    };
}

export function poll(fn, timeout, interval = 100) {
    const endTime = Number(new Date()) + (timeout || 2000);

    const checkCondition = (resolve, reject) => {
        // If the condition is met, we're done!
        const result = fn();

        result
            .then((r) => {
                if (r instanceof Error) {
                    reject(r);
                } else if (r) {
                    resolve(r);
                } else if (Number(new Date()) < endTime) {
                    // If the condition isn't met but the timeout hasn't elapsed, go again
                    setTimeout(checkCondition, interval, resolve, reject);
                } else {
                    // Didn't match and too much time, reject!
                    reject(new Error('timeout'));
                }
            })
            .catch((e) => {
                reject(e);
            });
    };

    return new Promise(checkCondition);
}

const checkTokenAndFetch = (url, headers, body = null, signal = null) => new Promise((resolve, reject) => {
    if (Auth.isAccessTokenExpiring()) {
        Auth.renewToken()
            .then(() => {
                resolve(fetch(url, { ...headers(body), signal, timeout: NETWORK_CALL_TIMEOUT }));
            })
            .catch((err) => {
                reject(err);
            });
    } else {
        try {
            resolve(fetch(url, { ...headers(body), signal, timeout: NETWORK_CALL_TIMEOUT }));
        } catch (e) {
            reject(e);
        }
    }
});

export const getJSON = (url, signal) => checkTokenAndFetch(url, setGetHeaders, null, signal)
    .then(checkStatus)
    .then(parseJSON);

export const putJSON = (url, body) => checkTokenAndFetch(url, setPutHeaders, body)
    .then(checkStatus)
    .then(parseJSON);

export const patchJSON = (url, body) => checkTokenAndFetch(url, setPatchHeaders, body)
    .then(checkStatus)
    .then(parseJSON);

export const deleteJSON = (url, body) => checkTokenAndFetch(url, setDeleteHeaders, body)
    .then(checkStatus)
    .then(parseJSON);

export const postJSON = (url, body) => checkTokenAndFetch(url, setPostHeaders, body)
    .then(checkStatus)
    .then(parseJSON);

export const getJSONAndDownload = (url, body) => checkTokenAndFetch(url, setGetHeaders, body)
    .then(checkStatus)
    .then(parseBlob);

export const postJSONAndDownload = (url, body) => checkTokenAndFetch(url, setPostHeaders, body)
    .then(checkStatus)
    .then(parseBlob);

export const getAuthHeaders = () => {
    const accessToken = Auth.getAccessToken();
    const h = {};
    if (accessToken) {
        h.Authorization = `Bearer ${accessToken}`;
    }
    return h;
};

export function getGroupHeaders() {
    const groupHeader = {};
    const getActiveGroup = Auth.getActiveUserGroup();
    if (getActiveGroup) {
        groupHeader['Current-Entity-Id'] = getActiveGroup.entity_id;
        groupHeader['Current-Group'] = humps.decamelize(getActiveGroup.group, {
            separator: '_',
        });
    }
    return groupHeader;
}
