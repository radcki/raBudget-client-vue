import config from 'config';
import { apiHandler } from './apiHandler';


export const allocationsService = {
    createAllocation,
    listAllocations,
    getAllocation,
    updateAllocation,
    deleteAllocation
};


function createAllocation(allocationData) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            description: allocationData.description,
            amount: allocationData.amount,
            date: allocationData.date,
            destinationCategory: {
                categoryId: allocationData.category
            },
            sourceCategory: {
                categoryId: allocationData.sourceCategory
            }
        })
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/allocations/create`, requestOptions);
}

function deleteAllocation(id) {
    const requestOptions = {
        method: 'DELETE',
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/allocations/${id}/delete`, requestOptions);
}


function updateAllocation(allocationData) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({            
            description: allocationData.description,
            amount: allocationData.amount,
            date: allocationData.date,
            destinationCategory: {
                categoryId: allocationData.category
            }
        })
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/allocations/${allocationData.allocationId}/update`, requestOptions);
}

function listAllocations(budgetId, limitCount, startDate, endDate, categories){
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            budgetId: budgetId,
            groupCount: limitCount,
            startDate: startDate,
            endDate: endDate,
            categories: categories
        })
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/allocations/list`, requestOptions);
}

function getAllocation(allocationId){
    const requestOptions = {
        method: 'GET',
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/allocations/` + allocationId, requestOptions);
}