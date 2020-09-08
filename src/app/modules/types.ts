const createActionName = (name: any) => `app/page/${name}`;
export const PAGE_SET = createActionName('PAGE_SET');
export const FETCHING_DATA_SUCCESS = createActionName('FETCHING_DATA_SUCCESS');
export const FETCHING_DATA_REQUEST = createActionName('FETCHING_DATA_REQUEST');
export const FETCHING_DATA_FAILURE = createActionName('FETCHING_DATA_FAILURE');
export const FETCHING_DATA = createActionName('FETCHING_DATA');

export interface DataProps {
    isFetching: boolean;
    page: number;
    data: any;
    totalPages: number;
}
