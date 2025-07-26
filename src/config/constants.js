export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const ARTICLE_STATUS = {
    DRAFT: 'DRAFT',
    UNDER_REVIEW: 'UNDER_REVIEW',
    PUBLISHED: 'PUBLISHED'
};

export const USER_ROLES = {
    JOURNALIST: 'JOURNALIST',
    REVIEWER: 'REVIEWER',
    ADMIN: 'ADMIN'
};