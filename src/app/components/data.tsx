import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StyledWrapper = styled.div`
    
`;

interface DataProps {
    page: number;
    fetchData: any;
    isFetching: any;
}

const data: React.FC<DataProps> = ({ page, fetchData, isFetching }) => {
console.log('fetchData', fetchData);
// const data = ({
//         isFetching,
//         ...props
//     }) => {

    // const getExpressInterestData = (data) => {
    //     if (abortRef) {
    //         abortRef.abort();
    //     }
    //     abortRef = new AbortController();
    //     fetchExpressInterest(
    //         data,
    //         entityId,
    //         abortRef.signal
    //     );
    // };

    // const checkEntity = (activeTab) => {
    //     if (entityId === '') {
    //         getExpressInterestData({
    //             page: 1,
    //             status: activeTab,
    //             pagination: true,
    //         });
    //     }
    //     else {
    //         getExpressInterestData({
    //             customerId: entityId,
    //             page: 1,
    //             status: activeTab,
    //             pagination: true,
    //         });
    //     }
    // }

    useEffect(() => {
        fetchData();
    }, [])


    // const handleViewMore = () => {
    //     setPage && setPage(page + 1);
    //     getExpressInterestData({
    //         page: page + 1,
    //         status: (activeTab === 'all' ? activeTab : activeTab),
    //         pagination: true,
    //     });
    // }

    return (
        <StyledWrapper>
            <ul>
            {fetchData.map((d) => (
                <li>
                <img src={d.name} alt="logo" />
                <p>{}</p>
                </li>
            ))}
            </ul>
        </StyledWrapper>
    )
}

export default data;
