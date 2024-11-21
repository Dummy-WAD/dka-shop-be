export const convertTime = (date) => {
    return new Date(new Date(date).getTime() + (7 * 60 * 60 * 1000));
};