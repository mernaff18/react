import { 
    DataProps, 
    PAGE_SET,
    FETCHING_DATA,
} from './types';
import { toastr } from 'react-redux-toastr';
// import * as fetchUtils from '../utils/fetchUtils';
import humps from 'humps';

const initialState: DataProps = {
    data: [],
    isFetching: false,
    page: 1,
    totalPages: 0,
};

export default function authed(state: DataProps = initialState, action: any) {
    switch (action.type) {
        case FETCHING_DATA:
            return {
                ...state,
                isFetching: action.status,
                statusHeader: action.status,
            };
        case PAGE_SET:
            return {
                ...state,
                page: action.page,
            };
        default:
            return state;
    }
}

export function fetchingData() {
    return {
        type: FETCHING_DATA,
    };
}

// actions
// export function setPage(page) {
//     return dispatch => dispatch({ type: PAGE_SET, page });
// }

export function fetchData() {
    return (dispatch: any) => {
        dispatch({ type: FETCHING_DATA }) 
        const hp = { ...humps, page_size: 10 };
        return dispatch
            .patchJSON('src/API/CONTENTLISTINGPAGE-PAGE1.json', humps.decamelizeKeys({  }))
            // .then(d => humps.camelizeKeys(d))
            .then((data: any) => {
                const { customerInterestRelation = [], statusHeader = {}, totalPages } = data;
                dispatch(fetchingData());
                return dispatch({
                    type: FETCHING_DATA,
                    totalPages,
                });
            })
            .catch((ex: any) => dispatch.handleErrorV2(dispatch, ex).then((m: any) => {
                    toastr.error('Error loading', m);
            }));

    };
}