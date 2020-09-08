import { connect } from 'react-redux';
import data from '../components';
import { fetchData } from '../modules/reducer';

const mapStateToProps = (state, props) => {
    return {
        isFetching: state && state.data,
    }
    
};


export default connect(
    mapStateToProps,
    {
        fetchData,
    },
)(data);
