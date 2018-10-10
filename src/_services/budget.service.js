import config from 'config';
import { apiHandler } from './apiHandler';


export const budgetService = {
    userBudgets,
    createBudget,
    deleteBudget,
    saveBudget,
    getBudget,
    saveCategory,
    deleteCategory,
    getSpendingCategoriesBalance,
    getIncomeCategoriesBalance,
    getSavingCategoriesBalance,
    getUnassigned,
    setDefault
};

function userBudgets() {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets`, requestOptions);
}

function createBudget(budgetData, budgetCategories) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            budgetName: budgetData.name,
            currency: budgetData.currency,
            startingDate: budgetData.startDate,
            spendingCategories: budgetCategories.spending,
            incomeCategories: budgetCategories.income,
            savingCategories: budgetCategories.savings
        })
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/create`, requestOptions);
}

function saveBudget(budgetId, budgetData) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            budgetName: budgetData.name,
            startingDate: budgetData.startDate,
            currency: budgetData.currency,
            defailt: budgetData.default
        })
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${budgetId}/update`, requestOptions);
}

function setDefault(budgetId) {
    const requestOptions = {
        method: 'POST'
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${budgetId}/setDefault`, requestOptions);
}


function deleteBudget(budgetId) {
    const requestOptions = {
        method: 'DELETE'
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${budgetId}/delete`, requestOptions);
}

function getBudget(id) {
    const requestOptions = {
        method: 'GET',
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${id}`, requestOptions);
}

function getUnassigned(budgetId) {
    const requestOptions = {
        method: 'GET',
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${budgetId}/unassigned`, requestOptions);
}

function getSpendingCategoriesBalance(budgetId) {
    const requestOptions = {
        method: 'GET',
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${budgetId}/categoriesbalance/spending`, requestOptions);
}

function getIncomeCategoriesBalance(budgetId) {
    const requestOptions = {
        method: 'GET',
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${budgetId}/categoriesbalance/income`, requestOptions);
}

function getSavingCategoriesBalance(budgetId) {
    const requestOptions = {
        method: 'GET',
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${budgetId}/categoriesbalance/saving`, requestOptions);
}

function saveCategory(budgetId, category) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            categoryId: category.categoryId,
            name: category.name,
            icon: category.icon,
            amount: category.amount,
            type: category.type
        })
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${budgetId}/savecategory`, requestOptions);
}

function deleteCategory(budgetId, categoryId) {
    const requestOptions = {
        method: 'DELETE',
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/budgets/${budgetId}/deletecategory/${categoryId}`, requestOptions);
}
